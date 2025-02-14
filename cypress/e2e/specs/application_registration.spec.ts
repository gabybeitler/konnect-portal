import { AuthStrategyClientCredentialsCredentialTypeEnum, AuthStrategyKeyAuthCredentialTypeEnum, CredentialCreationResponse, GetApplicationResponse, ListAuthStrategiesItem, ListCredentialsResponse, ListCredentialsResponseDataInner, ListRegistrationsResponse } from '@kong/sdk-portal-js'
import { product, versions, productRegistration, apps, productWithKeyAuthAppAuthStrategy, appWithAuthStrategy, versionWithKeyAuthAuthStrategy, versionWithOidcAuthStrategy } from '../fixtures/consts'

const mockApplicationWithCredAndReg = (
  data: GetApplicationResponse,
  credentials: ListCredentialsResponseDataInner[] = [],
  registrations = []
) => {
  const applicationResponse: GetApplicationResponse = data

  cy.intercept('GET', `**/api/v2/applications/${data.id}`, {
    statusCode: 200,
    body: applicationResponse
  }).as('getApplication')

  const credsResponse: ListCredentialsResponse = {
    data: credentials,
    meta: {
      page: {
        total: credentials.length,
        size: 10,
        number: 1
      }
    }
  }

  cy.intercept('GET', `**/api/v2/applications/${data.id}/credentials*`, {
    statusCode: 200,
    body: credsResponse
  }).as('getApplicationCredentials')

  const registrationsResponse: ListRegistrationsResponse = {
    data: registrations,
    meta: {
      page: {
        total: registrations.length,
        size: 10,
        number: 1
      }
    }
  }

  cy.intercept('GET', `**/api/v2/applications/${data.id}/registrations*`, {
    statusCode: 200,
    body: registrationsResponse
  }).as('getApplicationRegistrations')
}

Cypress.Commands.add('createNewApplication', (app, productId, versions) => {
  const selectors = {
    appRegModal: '[data-testid="application-registration-modal"]'
  }

  const submitButton = 'button[type="submit"]'

  cy.viewport(1440, 900)
  cy.mockProductDocumentTree(productId)
  cy.mockProductDocument(productId)
  cy.mockApplications([], 0)
  cy.mockRegistrations(app.id)

  cy.mockProduct(productId, product, versions)
  cy.mockProductVersionSpec(productId, versions[0].id)
  cy.mockProductOperations(productId, versions[0].id, versions[0].operations)

  cy.mockProductVersionApplicationRegistration(versions[0])

  cy.intercept('POST', '**/api/v2/applications', {
    body: {
      id: '1'
    }
  }).as('postApplicationRegistration')

  cy.mockPrivatePortal()

  cy.visit(`/spec/${productId}`)
  cy.get('.swagger-ui', { timeout: 12000 })
  cy.get('[data-testid="register-button"]', { timeout: 12000 })
    .click({ force: true })
  cy.get(selectors.appRegModal).should('exist')
  cy.get('[data-testid="create-application"]').click()
  cy.get('header h1').should('contain', 'Create New Application')

  cy.mockApplications([app], 1)
  cy.mockPrivatePortal()

  cy.get(submitButton).should('be.disabled')
  cy.get('[data-testid="application-name-input"]').type(app.name, { delay: 0 })
  cy.get('[data-testid="reference-id-input"]').type(app.reference_id, { delay: 0 })
  cy.get(submitButton).should('not.be.disabled')
  cy.get(submitButton).click()

  cy.url().should('include', `/spec/${productId}`)

  return cy.document().then(document => {
    const params = (new URL(document.location.toString())).searchParams

    return params.get('application')
  })
})

describe('Application Registration', () => {
  const selectors = {
    appRegModal: '[data-testid="application-registration-modal"]'
  }

  const credentials: ListCredentialsResponseDataInner[] = [
    {
      id: '2433d1ba-1ba4-46d9-9c55-dde7cbcd8bd6',
      display_name: '4hloijU1YDWzeY003FKKZCeFUBNBXaxo'
    }
  ]

  const submitButton = 'button[type="submit"]'

  beforeEach(() => {
    cy.mockPrivatePortal()
    cy.mockAppearance()
    cy.mockStylesheetCss()
    cy.mockStylesheetFont()
    cy.mockContextualAnalytics()
  })

  it('displays empty dashboard for my apps', () => {
    cy.mockApplications([], 0)
    cy.visit('/my-apps')

    cy.get('[data-testid="create-application-button"]').should('exist')
    cy.get('[data-testid="create-application-link"]').should('exist')
    cy.get('[data-testid="empty-state-card"]')
      .should('exist')
      .should('contain', 'No Applications')
  })

  describe('Create Application', () => {
    it('can create a new applications from spec page', () => {
      mockApplicationWithCredAndReg(apps[0])
      cy.mockProductVersionAvailableRegistrations(product.id, versions[0].id, [])
      cy.mockApplications([apps[0]], 1)
      cy.createNewApplication(apps[0], product.id, versions)
    })
    it('can create an application with DCR for portal enabled', () => {
      cy.mockApplications([], 0)
      cy.mockDcrPortal()
      cy.visit('/my-apps')

      cy.get('[data-testid="create-application-button"]').should('exist')
      cy.get('[data-testid="create-application-link"]').should('exist')
      cy.get('[data-testid="create-application-button"]').click()

      cy.get('header h1').should('contain', 'Create New Application')
      cy.get(submitButton).should('be.disabled')
      cy.get('[data-testid="application-name-input"]').type(apps[3].name, { delay: 0 })
      cy.get('#description').type(apps[3].description, { delay: 0 })
      cy.get('#redirectUri').type(apps[3].redirect_uri, { delay: 0 })
      cy.get(submitButton).should('not.be.disabled')

      cy.intercept('POST', '**/api/v2/applications', {
        body: {
          id: apps[0].id,
          credentials: {
            client_id: 'your-client-id',
            client_secret: 'your-client-secret'
          }
        }
      }).as('postApplicationRegistration')
      mockApplicationWithCredAndReg(apps[3])
      mockApplicationWithCredAndReg(apps[0])

      cy.get(submitButton).click()

      cy.wait('@postApplicationRegistration').then(() => {
        cy.get('[data-testid="copy-secret-modal"]').should('exist')
        cy.get('[data-testid="copy-button"]').eq(0).should('exist').should('contain', 'your-client-id')
        cy.get('[data-testid="copy-button"]').eq(1).should('exist').should('contain', 'your-client-secret')
        cy.get('[data-testid="close-application-secret-modal"]').should('exist').click()

        cy.get('.k-alert.success').should('exist')
      })
    })

    it('appregv2 - can create an application with DCR for portal enabled - 1 auth strat', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: true
        }
      ])
      cy.mockApplications([], 0)
      cy.mockApplicationAuthStrategies([{ name: 'foo', id: '1', credential_type: 'client_credentials' } as ListAuthStrategiesItem], 0)

      cy.mockDcrPortal()
      cy.visit('/my-apps')

      cy.get('[data-testid="create-application-button"]').should('exist')
      cy.get('[data-testid="create-application-link"]').should('exist')
      cy.get('[data-testid="create-application-button"]').click()

      cy.get('header h1').should('contain', 'Create New Application')
      cy.get(submitButton).should('be.disabled')
      cy.get('[data-testid="application-name-input"]').type(apps[3].name, { delay: 0 })
      cy.get('#description').type(apps[3].description, { delay: 0 })
      cy.get('#redirectUri').type(apps[3].redirect_uri, { delay: 0 })
      cy.get(submitButton).should('not.be.disabled')

      cy.intercept('POST', '**/api/v2/applications', {
        body: {
          id: apps[0].id,
          credentials: {
            client_id: 'your-client-id',
            client_secret: 'your-client-secret'
          }
        }
      }).as('postApplicationRegistration')
      mockApplicationWithCredAndReg(apps[3])
      mockApplicationWithCredAndReg(apps[0])

      cy.get(submitButton).click()

      cy.wait('@postApplicationRegistration').then(() => {
        cy.get('[data-testid="copy-secret-modal"]').should('exist')
        cy.get('[data-testid="copy-button"]').eq(0).should('exist').should('contain', 'your-client-id')
        cy.get('[data-testid="copy-button"]').eq(1).should('exist').should('contain', 'your-client-secret')
        cy.get('[data-testid="close-application-secret-modal"]').should('exist').click()

        cy.get('.k-alert.success').should('exist')
      })
    })

    it('appregv2 - can create an application with key-auth for portal enabled - 1 auth strat', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: true
        }
      ])
      cy.mockApplications([], 0)
      cy.mockApplicationAuthStrategies([{ name: 'foo', id: '1', credential_type: 'key_auth' } as ListAuthStrategiesItem], 0)

      cy.mockDcrPortal()
      cy.visit('/my-apps')

      cy.get('[data-testid="create-application-button"]').should('exist')
      cy.get('[data-testid="create-application-link"]').should('exist')
      cy.get('[data-testid="create-application-button"]').click()

      cy.get('header h1').should('contain', 'Create New Application')
      cy.get(submitButton).should('be.disabled')
      cy.get('[data-testid="application-name-input"]').type(apps[3].name, { delay: 0 })
      cy.get('#description').type(apps[3].description, { delay: 0 })
      cy.get('[data-testid="reference-id-input"]').type(apps[3].reference_id, { delay: 0 })
      cy.get(submitButton).should('not.be.disabled')

      cy.intercept('POST', '**/api/v2/applications', {
        body: {
          id: apps[0].id,
          credentials: {
            client_id: 'your-client-id',
            client_secret: 'your-client-secret'
          }
        }
      }).as('postApplicationRegistration')
      mockApplicationWithCredAndReg(apps[3])
      mockApplicationWithCredAndReg(apps[0])

      cy.get(submitButton).click()

      cy.wait('@postApplicationRegistration').then(() => {
        cy.get('[data-testid="copy-secret-modal"]').should('not.exist')
        cy.get('.k-alert.success').should('exist')
      })
    })

    it('appregv2 - can create an application with DCR for portal enabled - many auth strat', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: true
        }
      ])
      cy.mockApplications([], 0)
      cy.mockApplicationAuthStrategies([
        { name: 'foo', id: '1', credential_type: 'client_credentials' },
        { name: 'bar', id: '2', credential_type: 'key_auth' },
        { name: 'baz', id: '3', credential_type: 'self_managed_client_credentials' }
      ] as ListAuthStrategiesItem[], 0)

      cy.mockDcrPortal()
      cy.visit('/my-apps')

      cy.get('[data-testid="create-application-button"]').should('exist')
      cy.get('[data-testid="create-application-link"]').should('exist')
      cy.get('[data-testid="create-application-button"]').click()

      cy.get('header h1').should('contain', 'Create New Application')
      cy.get(submitButton).should('be.disabled')
      cy.get('[data-testid="application-name-input"]').type(apps[3].name, { delay: 0 })
      cy.get('#description').type(apps[3].description, { delay: 0 })

      cy.get('[data-testid="application-auth-strategy-select"]').click()
      cy.get('[data-testid="k-select-item-2"] > .k-select-item-container > button').contains('bar').click()
      cy.get('#redirectUri').should('not.exist')
      cy.get('[data-testid="reference-id-input"]').should('exist')

      cy.get('[data-testid="application-auth-strategy-select"]').click()
      cy.get('[data-testid="k-select-item-3"] > .k-select-item-container > button').contains('baz').click()
      cy.get('#redirectUri').should('exist')
      cy.get('[data-testid="reference-id-input"]').should('exist')

      cy.get('[data-testid="application-auth-strategy-select"]').click()
      cy.get('[data-testid="k-select-item-1"] > .k-select-item-container > button').contains('foo').click()
      cy.get('#redirectUri').should('exist')
      cy.get('[data-testid="reference-id-input"]').should('not.exist')

      cy.get('#redirectUri').type(apps[3].redirect_uri, { delay: 0 })

      cy.get(submitButton).should('not.be.disabled')

      cy.intercept('POST', '**/api/v2/applications', {
        body: {
          id: apps[0].id,
          credentials: {
            client_id: 'your-client-id',
            client_secret: 'your-client-secret'
          }
        }
      }).as('postApplicationRegistration')
      mockApplicationWithCredAndReg(apps[3])
      mockApplicationWithCredAndReg(apps[0])

      cy.get(submitButton).click()

      cy.wait('@postApplicationRegistration').then(() => {
        cy.get('[data-testid="copy-secret-modal"]').should('exist')
        cy.get('[data-testid="copy-button"]').eq(0).should('exist').should('contain', 'your-client-id')
        cy.get('[data-testid="copy-button"]').eq(1).should('exist').should('contain', 'your-client-secret')
        cy.get('[data-testid="close-application-secret-modal"]').should('exist').click()

        cy.get('.k-alert.success').should('exist')
      })
    })
    it('can create a new application from my-appglo dashboard', () => {
      cy.mockApplications(apps, 4)
      cy.visit('/my-apps')

      cy.get('[data-testid="create-application-button"]').click()

      cy.get('header h1').should('contain', 'Create New Application')
      cy.get(submitButton).should('be.disabled')
      cy.get('[data-testid="application-name-input"]').type(apps[0].name, { delay: 0 })
      cy.get('#description').type(apps[0].description, { delay: 0 })
      cy.get('[data-testid="reference-id-input"]').type(apps[0].reference_id, { delay: 0 })
      cy.get(submitButton).should('not.be.disabled')

      cy.intercept('POST', '**/api/v2/applications', {
        body: {
          id: apps[0].id
        }
      }).as('postApplicationRegistration')
      mockApplicationWithCredAndReg(apps[0])

      cy.get(submitButton).click()

      cy.get('.k-alert.success').should('exist')
      cy.contains(apps[0].name)
      cy.contains(apps[0].description)
      cy.contains(apps[0].reference_id)
    })
    it('can generate reference Id via button', () => {
      cy.mockApplications(apps, 4)
      cy.visit('/my-apps')

      cy.get('[data-testid="create-application-button"]').click()

      cy.get('[data-testid="generate-reference-id"]').click()

      cy.get('[data-testid="reference-id-input"]').should('not.have.value', '')
    })

    it('appregv2 - create application form shows banner if no auth strategies and flag enabled', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: true
        }
      ])
      cy.mockApplicationAuthStrategies([], 0)
      cy.visit('/application/create')

      cy.get('[data-testid="application-name-input"]').type(apps[0].name, { delay: 0 })
      cy.get('#description').type(apps[0].description, { delay: 0 })
      cy.get('[data-testid="reference-id-input"]').type(apps[0].reference_id, { delay: 0 })
      cy.get(submitButton).should('be.disabled')
      cy.get('[data-testid="no-auth-strategies-warning"]').should('be.visible')
    })

    it('appregv2 - create application form does not show banner if flag disabled', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: false
        }
      ])
      cy.mockApplicationAuthStrategies([], 0)
      cy.visit('/application/create')

      cy.get('[data-testid="no-auth-strategies-warning"]').should('not.exist')
    })
    it('appregv2 - does not show warning banner if flag is not on', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: false
        }
      ])
      cy.mockApplications([], 0)
      cy.mockApplicationAuthStrategies([], 0)
      cy.visit('/my-apps')

      cy.get('[data-testid="create-application-button"]').should('not.be.disabled')
      cy.get('[data-testid="no-auth-strategies-warning"]').should('not.exist')
    })

    it('appregv2 - shows warning banner if no available auth strategies', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: true
        }
      ])
      cy.mockApplications([], 0)
      cy.mockApplicationAuthStrategies([], 0)
      cy.visit('/my-apps')

      cy.get('[data-testid="create-application-button"]').should('have.attr', 'disabled', 'disabled')
      cy.get('[data-testid="no-auth-strategies-warning"]').should('be.visible')
    })
  })

  it('can return to My Apps from application details via breadcrumb', () => {
    cy.mockDeveloperRefresh()
    cy.mockApplications(apps, 4)
    // navigate directly to My Apps
    cy.visit('/my-apps')

    mockApplicationWithCredAndReg(apps[0])
    // go to application details
    cy.get('[data-testid="applications-table"] tbody tr')
      .contains(apps[0].name)
      .click()

    // use breadcrumb to navigate back to My Apps
    cy.get('.k-breadcrumbs .k-breadcrumbs-item a').contains('My Apps').click()
    cy.url().should('include', 'my-apps')
  })

  it('can edit an existing application', () => {
    cy.mockApplications(apps, 4)
    cy.visit('/my-apps')

    mockApplicationWithCredAndReg(apps[0])
    cy.get('[data-testid="applications-table"] tbody tr')
      .contains(apps[0].name)
      .click()

    cy.get('[data-testid="application-update-button"]').click()
    cy.get('header h1').should('contain', 'Update Application')

    cy.get('[data-testid="application-name-input"]').type('{end}z', { delay: 0 })

    cy.intercept('PATCH', `api/v2/applications/${apps[0].id}`, {
      statusCode: 200,
      body: { ...apps[0], name: apps[0].name + 'z' }
    }).as('getApplicationPatch')

    cy.intercept('GET', `api/v2/applications/${apps[0].id}`, {
      statusCode: 200,
      body: { ...apps[0], name: apps[0].name + 'z' }
    }).as('getApplication')

    cy.get(submitButton).click()
    cy.contains(apps[0].name + 'z')
  })
  it('can delete an existing application', () => {
    cy.mockApplications(apps, 4)
    cy.visit('/my-apps')

    mockApplicationWithCredAndReg(apps[0])

    cy.get('[data-testid="applications-table"] tbody tr')
      .should('have.length', 4)
      .contains(apps[0].name)
      .click()

    cy.get('[data-testid="application-update-button"]').click()
    cy.get('header h1').should('contain', 'Update Application')

    // Delete and cancel during confirmation
    cy.get('[data-testid="application-delete-button"]').click()
    cy.get('[data-testid="application-delete-modal"]').should('exist')
    cy.get('[data-testid="application-delete-cancel-button"]').click()
    cy.get('[data-testid="application-delete-modal"]').should('not.exist')

    cy.intercept('DELETE', `api/v2/applications/${apps[0].id}`, {
      statusCode: 200
    }).as('deleteApplication')

    cy.mockApplications([...apps.slice(1)], 2)

    // Delete and confirm deletion
    cy.get('[data-testid="application-delete-button"]').click()
    cy.get('[data-testid="application-delete-modal"]').should('exist')
    cy.get('[data-testid="application-delete-confirm-button"]').click()

    cy.get('.toaster-container-outer .message').should(
      'contain',
      'Application successfully deleted'
    )

    cy.get('[data-testid="applications-table"] tbody tr')
      .should('have.length', 3)
      .contains(apps[0].name)
      .should('not.exist')
  })

  it('shows granted scopes if present ', () => {
    cy.mockApplications(apps, 1)
    cy.visit('/my-apps')

    mockApplicationWithCredAndReg(apps[0], [], [
      {
        id: 'regId',
        product_id: 'id',
        product_name: 'mockbin',
        product_version_id: 'pvid',
        product_version_name: 'version_name',
        application_id: apps[0].id,
        status: 'approved',
        created_at: '2023-11-24T17:35:52.765Z',
        updated_at: '2023-11-24T17:49:32.719Z',
        granted_scopes: [
          'scope1',
          'scope2'
        ]
      }
    ])
    cy.get('[data-testid="applications-table"] tbody tr')
      .contains(apps[0].name)
      .click()

    cy.get('[data-testid="granted-scope1"]').should('exist')
    cy.get('[data-testid="granted-scope2"]').should('exist')
    cy.get('[data-testid="show-more-scopes"]').should('not.exist')
  })

  it('shows granted scopes if present - show more badge exists', () => {
    cy.mockApplications(apps, 1)
    cy.visit('/my-apps')

    mockApplicationWithCredAndReg(apps[0], [], [
      {
        id: 'regId',
        product_id: 'id',
        product_name: 'mockbin',
        product_version_id: 'pvid',
        product_version_name: 'version_name',
        application_id: apps[0].id,
        status: 'approved',
        created_at: '2023-11-24T17:35:52.765Z',
        updated_at: '2023-11-24T17:49:32.719Z',
        granted_scopes: [
          'scope1',
          'scope2',
          'scope3',
          'scope4'
        ]
      }
    ])
    cy.get('[data-testid="applications-table"] tbody tr')
      .contains(apps[0].name)
      .click()

    cy.get('[data-testid="granted-scope1"]').should('exist')
    cy.get('[data-testid="granted-scope2"]').should('exist')
    cy.get('[data-testid="show-more-scopes"]').should('exist').click().then(() => {
      cy.get('[data-testid="granted-scope4"]').should('exist')
    })
  })

  it('does not show granted scopes if not in response ', () => {
    cy.mockApplications(apps, 1)
    cy.visit('/my-apps')

    mockApplicationWithCredAndReg(apps[0], [], [
      {
        id: 'regId',
        product_id: 'id',
        product_name: 'mockbin',
        product_version_id: 'pvid',
        product_version_name: 'version_name',
        application_id: apps[0].id,
        status: 'approved',
        created_at: '2023-11-24T17:35:52.765Z',
        updated_at: '2023-11-24T17:49:32.719Z'
      }
    ])
    cy.get('[data-testid="applications-table"] tbody tr')
      .contains(apps[0].name)
      .click()

    cy.get('[data-testid="products-list"]')
      .should('not.include.text', 'Scopes')
    cy.get('.badge-container').should('not.exist')
  })

  describe('Credentials Management', () => {
    it("doesn't display unhashed credentials column", () => {
      cy.mockApplications(apps, 4)
      cy.visit('/my-apps')

      mockApplicationWithCredAndReg(apps[0], [credentials[0]])

      cy.get('[data-testid="applications-table"] tbody tr')
        .contains(apps[0].name)
        .click()

      cy.get('[data-testid="credentials-list"] thead th').should('exist').should('not.contain', 'API Key')
    })

    it('can create and copy credentials for application via modal', () => {
      cy.mockApplications(apps, 4)
      cy.visit('/my-apps')
      mockApplicationWithCredAndReg(apps[0])
      cy.get('[data-testid="applications-table"] tbody tr')
        .contains(apps[0].name)
        .click()

      cy.get('.credentials-list .empty-state-wrapper').should(
        'contain',
        'No Credentials'
      )

      const createCredResponseBody: CredentialCreationResponse = {
        credential: 'credentialKey',
        id: 'id',
        display_name: 'display-name'
      }

      cy.intercept('POST', `api/v2/applications/${apps[0].id}/credentials*`, {
        statusCode: 201,
        body: createCredResponseBody
      }).as('createApplicationCredentials')

      const credentialsResonse: ListCredentialsResponse = { data: [credentials[0]], meta: { page: { total: 1, size: 10, number: 1 } } }

      cy.intercept('GET', `api/v2/applications/${apps[0].id}/credentials*`, {
        statusCode: 200,
        body: credentialsResonse
      }).as('getApplicationCredentials')

      cy.get('[data-testid="generate-credential-button"]').click()
      cy.get('[data-testid="display-name-input"]').type('display-name').then(() => {
        cy.get('[data-testid="create-credential-modal-button"]').click()
        cy.wait('@createApplicationCredentials').then(() => {
          cy.get('[data-testid="copy-button"]').should('exist')
          cy.get('[data-testid="copy-credentials-confirm-modal-button"]').should('exist').click()
          cy.get('.toaster-container-outer .message').should(
            'contain',
            'copied to clipboard'
          )

          cy.get('[data-testid="credentials-list"] tbody tr')
            .should('exist')
            .should('have.length', 1)
        })
      })
    })
  })
  it('credential\'s display name is visible and editable, id is displayed', () => {
    cy.mockApplications(apps, 4)
    mockApplicationWithCredAndReg(apps[0], credentials)

    cy.visit('/my-apps')
    cy.get('[data-testid="applications-table"] tbody tr')
      .contains(apps[0].name)
      .click()

    cy.intercept('PUT', `api/v2/applications/${apps[0].id}/credentials/${credentials[0].id}`, {
      statusCode: 200,
      body: {}
    }).as('updateApplicationCredential')

    cy.wait('@getApplicationCredentials').then(() => {
      // Mock the update call
      cy.intercept('GET', `api/v2/applications/${apps[0].id}/credentials*`, {
        statusCode: 200,
        body: {
          data: [{
            id: credentials[0].id,
            key: credentials[0].display_name,
            display_name: 'new-display-name'
          }],
          meta: {
            page: {
              total: 1,
              size: 10,
              number: 1
            }
          }
        }
      })
      cy.get('[data-testid="credentials-list"] tbody tr')
        .should('exist')
        .should('have.length', 1)
      cy.get('[data-testid="action-badge"]').click()
      cy.get('.k-popover-content .rename-item').click()
      cy.get('[data-testid="display-name-modal"]').should('exist')
      cy.get('[data-testid="rename-display-name-input"]').type('new-display-name{enter}')

      cy.wait('@updateApplicationCredential').then(() => {
        cy.get('[data-testid="credentials-list"] tbody tr').contains('new-display-name')
      })
    })
  })

  it('can create and delete credentials for application', () => {
    cy.mockApplications(apps, 4)
    cy.visit('/my-apps')

    mockApplicationWithCredAndReg(apps[0])

    cy.get('[data-testid="applications-table"] tbody tr')
      .contains(apps[0].name)
      .click()

    cy.get('.credentials-list .empty-state-wrapper').should(
      'contain',
      'No Credentials'
    )

    cy.intercept('POST', `api/v2/applications/${apps[0].id}/credentials*`, {
      statusCode: 201,
      body: {
        credential: 'credentialKey',
        id: 'id',
        display_name: 'display-name'
      }
    }).as('createApplicationCredentials')

    cy.intercept('GET', `api/v2/applications/${apps[0].id}/credentials*`, {
      statusCode: 200,
      body: { data: [credentials[0]], meta: { page: { total: 1, size: 10, number: 1 } } }
    }).as('getApplicationCredentials')

    cy.get('[data-testid="generate-credential-button"]').click()
    cy.get('[data-testid="display-name-input"]').type('display-name').then(() => {
      cy.get('[data-testid="create-credential-modal-button"]').click()
      cy.wait('@createApplicationCredentials').then(() => {
        cy.get('[data-testid="copy-button"]').should('exist')
        cy.get('[data-testid="copy-credentials-confirm-modal-button"]').should('exist').click()
        cy.get('.toaster-container-outer .message').should(
          'contain',
          'copied to clipboard'
        )

        cy.get('[data-testid="credentials-list"] tbody tr')
          .should('exist')
          .should('have.length', 1)
      })

      cy.intercept(
        'DELETE',
        `api/v2/applications/${apps[0].id}/credentials/${credentials[0].id}`,
        {
          statusCode: 200
        }
      ).as('deleteApplicationCredentials')

      cy.intercept('GET', `api/v2/applications/${apps[0].id}/credentials*`, {
        statusCode: 200,
        body: { data: [], meta: { page: { total: 0, size: 10, number: 1 } } }
      }).as('getApplicationCredentials')

      cy.get('[data-testid="action-badge"]').click()
      cy.get('.k-popover-content .delete-item').click({ force: true })
      cy.get('[data-testid="revoke-credential-modal"]').should('exist')
      cy.get('[data-testid="revoke-credential-modal-button"]').should('exist').click()
      cy.get('.credentials-list .empty-state-wrapper').should(
        'contain',
        'No Credentials'
      )
    })
  })

  describe('Registration Management', () => {
    it('can request registration to a product', () => {
      cy.mockProductDocument()
      cy.mockProduct()
      cy.mockProductVersionApplicationRegistration(versions[0])
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)
      cy.get('.swagger-ui', { timeout: 12000 })

      cy.mockApplications(apps, 4)
      cy.mockProductVersionAvailableRegistrations(product.id, versions[0].id, apps)
      cy.mockGrantedScopes(versions[0].id, apps[0].id, ['scope1', 'scope2'])

      cy.get('[data-testid="register-button"]', { timeout: 12000 }).click()
      cy.get(selectors.appRegModal).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${apps[0].name}"]`).should('contain', apps[0].name).click()

      const mockCreateRegResponse = {
        ...productRegistration,
        status: 'pending',
        application: apps[0]
      }

      cy.intercept(
        'POST',
        `/api/v2/applications/${apps[0].id}/registrations*`,
        {
          body: mockCreateRegResponse
        }
      ).as('postApplicationRegistration')

      cy.get('[data-testid="submit-registration"]').click()
      cy.get(selectors.appRegModal).should(
        'contain',
        'You will be notified upon approval'
      )
    })
    it('appregv2 - can request registration to a product version with app auth strategy id with feature flag enabled', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: true
        }
      ])
      cy.mockProductDocument(productWithKeyAuthAppAuthStrategy.id)
      cy.mockProduct(productWithKeyAuthAppAuthStrategy.id, productWithKeyAuthAppAuthStrategy, [versionWithKeyAuthAuthStrategy])
      cy.mockProductVersionApplicationRegistration(versionWithKeyAuthAuthStrategy)
      cy.mockGetProductDocuments(productWithKeyAuthAppAuthStrategy.id)
      cy.mockProductOperations(productWithKeyAuthAppAuthStrategy.id, versionWithKeyAuthAuthStrategy.id)
      cy.mockProductVersionSpec(productWithKeyAuthAppAuthStrategy.id, versionWithKeyAuthAuthStrategy.id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${productWithKeyAuthAppAuthStrategy.id}`)
      cy.get('.swagger-ui', { timeout: 12000 })

      cy.mockApplications([appWithAuthStrategy], 1)
      cy.mockProductVersionAvailableRegistrations(productWithKeyAuthAppAuthStrategy.id, versionWithKeyAuthAuthStrategy.id, [appWithAuthStrategy])
      cy.mockGrantedScopes(versionWithKeyAuthAuthStrategy.id, appWithAuthStrategy.id, ['scope1', 'scope2'])
      cy.wait('@getProductVersions')

      cy.get('[data-testid="app-reg-v2-register-btn"]', { timeout: 12000 }).click()
      cy.wait('@getProductVersionAvailableRegistrations').then(interception => {
        // @ts-ignore the filter property is actually an object, but the type definition is wrong
        expect(interception.request.query.filter?.auth_strategy_id).to.eq(versionWithKeyAuthAuthStrategy.registration_configs[0].id)
      })
      cy.get(selectors.appRegModal).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${appWithAuthStrategy.name}"]`).should('contain', appWithAuthStrategy.name).click()

      const mockCreateRegResponse = {
        ...productRegistration,
        status: 'pending',
        application: appWithAuthStrategy
      }

      cy.intercept(
        'POST',
        `/api/v2/applications/${appWithAuthStrategy.id}/registrations*`,
        {
          body: mockCreateRegResponse
        }
      ).as('postApplicationRegistration')

      cy.get('[data-testid="submit-registration"]').click()
      cy.get(selectors.appRegModal).should(
        'contain',
        'You will be notified upon approval'
      )
    })
    it('appreg-v2 - feature flag off - does not show auth strategy card', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: false
        }
      ])
      cy.mockProductDocument()
      cy.mockProduct(product.id, product, [versionWithKeyAuthAuthStrategy])
      cy.mockProductVersionApplicationRegistration(versions[0])
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)
      cy.get('.swagger-ui', { timeout: 12000 }).should('exist')

      cy.get('[data-testid="auth-strategy-card"]').should('not.exist')
      cy.get('[data-testid="app-reg-v2-register-btn"]').should('not.exist')
      cy.get('[data-testid="register-button"]', { timeout: 12000 }).should('exist')
    })
    it('appreg-v2 - feature flag on - shows information about application auth strategy (key-auth)', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: true
        }
      ])
      cy.mockProductDocument()
      cy.mockProduct(product.id, product, [versionWithKeyAuthAuthStrategy])
      cy.mockProductVersionApplicationRegistration(versions[0])
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)
      cy.get('.swagger-ui', { timeout: 12000 }).should('exist')

      cy.get('[data-testid="auth-strategy-card"]').should('exist')
      cy.get('[data-testid="auth-strategy-title"]').should('exist').should('contain.text', versionWithKeyAuthAuthStrategy.registration_configs[0].name)
      cy.get('[data-testid="auth-method-key-auth"]').should('exist')
      cy.get('[data-testid="app-reg-v2-bearer"]').should('not.exist')
      cy.get('[data-testid="app-reg-v2-register-btn"]').should('exist')
      cy.get('[data-testid="register-button"]', { timeout: 12000 }).should('not.exist')
    })
    it('appreg-v2 - feature flag on - shows information about application auth strategy (oidc auth)', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: true
        }
      ])
      cy.mockProductDocument()
      cy.mockProduct(product.id, product, [versionWithOidcAuthStrategy])
      cy.mockProductVersionApplicationRegistration(versions[0])
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)
      cy.get('.swagger-ui', { timeout: 12000 }).should('exist')

      cy.get('[data-testid="auth-strategy-card"]').should('exist')
      cy.get('[data-testid="auth-strategy-title"]').should('exist').should('contain.text', versionWithOidcAuthStrategy.registration_configs[0].name)
      cy.get('[data-testid="auth-method-key-auth"]').should('not.exist')
      versionWithOidcAuthStrategy.registration_configs[0].auth_methods.forEach((method) => {
        cy.get(`[data-testid="auth-method-${method}"]`).should('exist')
      })
      cy.get('[data-testid="app-reg-v2-register-btn"]').should('exist')
      cy.get('[data-testid="register-button"]', { timeout: 12000 }).should('not.exist')
    })

    it('appregv2 - shows link to create new application if no applications match with feature flag enabled', () => {
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3531-app-reg-v2',
          value: true
        }
      ])
      cy.mockProductDocument(productWithKeyAuthAppAuthStrategy.id, versionWithKeyAuthAuthStrategy.id)
      cy.mockProduct(productWithKeyAuthAppAuthStrategy.id, productWithKeyAuthAppAuthStrategy, [versionWithKeyAuthAuthStrategy])
      cy.mockProductVersionApplicationRegistration(versionWithKeyAuthAuthStrategy)
      cy.mockGetProductDocuments(productWithKeyAuthAppAuthStrategy.id)
      cy.mockProductOperations(productWithKeyAuthAppAuthStrategy.id, versionWithKeyAuthAuthStrategy.id)
      cy.mockProductVersionSpec(productWithKeyAuthAppAuthStrategy.id, versionWithKeyAuthAuthStrategy.id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${productWithKeyAuthAppAuthStrategy.id}`)
      cy.get('.swagger-ui', { timeout: 12000 })

      cy.mockApplications([], 0)
      cy.mockProductVersionAvailableRegistrations(productWithKeyAuthAppAuthStrategy.id, versionWithKeyAuthAuthStrategy.id, [])

      cy.get('[data-testid="app-reg-v2-register-btn"]', { timeout: 12000 }).click()
      cy.get(selectors.appRegModal).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="create-application"]`).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="create-application"]`)
        .should('have.prop', 'href')
        .should('contain', `/application/create?product=${productWithKeyAuthAppAuthStrategy.id}&product_version=${versionWithKeyAuthAuthStrategy.id}&auth_strategy_id=${versionWithKeyAuthAuthStrategy.registration_configs[0].id}`)
    })

    it('does not show select available scopes if no scopes are available - feature flag on', () => {
      cy.mockProductDocument()
      cy.mockProduct()
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3460-developer-managed-scopes',
          value: true
        }
      ])
      cy.mockProductVersionApplicationRegistration(versions[0])
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)
      cy.get('.swagger-ui', { timeout: 12000 })

      cy.mockApplications(apps, 4)
      cy.mockProductVersionAvailableRegistrations(product.id, versions[0].id, apps)

      cy.get('[data-testid="register-button"]', { timeout: 12000 }).click()
      cy.get(selectors.appRegModal).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${apps[0].name}"]`).should('contain', apps[0].name).click()
      cy.get('[data-testid="available-scopes-select"]').should('not.exist')
    })
    it('does show select available scopes if scopes are available - feature flag on', () => {
      cy.mockProductDocument()
      cy.mockProduct(product.id, product)
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3460-developer-managed-scopes',
          value: true
        }
      ])
      cy.mockProductVersionApplicationRegistration(versions[0])
      // Update the version to include registration config
      const productVersionWithScopes = versions[0]

      productVersionWithScopes.registration_configs = [
        {
          name: 'openid-connect',
          available_scopes: [
            'scope1',
            'scope2'
          ]
        }
      ]
      cy.mockProductVersion(product.id, versions[0].id, productVersionWithScopes)
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)
      cy.get('.swagger-ui', { timeout: 12000 })

      cy.mockApplications(apps, 4)
      cy.mockProductVersionAvailableRegistrations(product.id, versions[0].id, apps)

      cy.get('[data-testid="register-button"]', { timeout: 12000 }).click()
      cy.get(selectors.appRegModal).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${apps[0].name}"]`).should('contain', apps[0].name).click()
      cy.get('.available-scopes-select').should('exist')
    })
    it('does not show select available scopes if scopes are available - feature flag off', () => {
      cy.mockProductDocument()
      cy.mockProduct(product.id, product)
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3460-developer-managed-scopes',
          value: false
        }
      ])
      cy.mockProductVersionApplicationRegistration(versions[0])
      // Update the version to include registration config
      const productVersionWithScopes = versions[0]

      productVersionWithScopes.registration_configs = [
        {
          name: 'openid-connect',
          available_scopes: [
            'scope1',
            'scope2'
          ]
        }
      ]
      cy.mockProductVersion(product.id, versions[0].id, productVersionWithScopes)
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)
      cy.get('.swagger-ui', { timeout: 12000 })

      cy.mockApplications(apps, 4)
      cy.mockProductVersionAvailableRegistrations(product.id, versions[0].id, apps)

      cy.get('[data-testid="register-button"]', { timeout: 12000 }).click()
      cy.get(selectors.appRegModal).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${apps[0].name}"]`).should('contain', apps[0].name).click()
      cy.get('.available-scopes-select').should('not.exist')
    })
    it('does not show select available scopes if feature flag off', () => {
      cy.mockProductDocument()
      cy.mockProduct()
      cy.mockLaunchDarklyFlags([
        {
          name: 'tdx-3460-developer-managed-scopes',
          value: false
        }
      ])
      cy.mockProductVersionApplicationRegistration(versions[0])
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', []) // mock with empty so that we add one.

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)
      cy.get('.swagger-ui', { timeout: 12000 })

      cy.mockApplications(apps, 4)
      cy.mockProductVersionAvailableRegistrations(product.id, versions[0].id, apps)

      cy.get('[data-testid="register-button"]', { timeout: 12000 }).click()
      cy.get(selectors.appRegModal).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${apps[0].name}"]`).should('contain', apps[0].name).click()
      cy.get('[data-testid="available-scopes-select"]').should('not.exist')
    })

    it('can request registration to a product and is directed to application upon auto_approval', () => {
      cy.mockProductDocument()
      cy.mockProduct()
      cy.mockProductVersionApplicationRegistration(versions[0])
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', [])

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)

      cy.mockApplications(apps, 4)
      cy.mockProductVersionAvailableRegistrations(product.id, versions[0].id, apps)
      cy.mockGrantedScopes(versions[0].id, apps[0].id, ['scope1', 'scope2'])

      cy.get('[data-testid="register-button"]', { timeout: 12000 }).click()
      cy.get(selectors.appRegModal).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${apps[0].name}"]`).should('contain', apps[0].name).click()

      cy.intercept(
        'POST',
        `/api/v2/applications/${apps[0].id}/registrations*`,
        {
          body: productRegistration
        }
      ).as('postApplicationRegistration')

      mockApplicationWithCredAndReg(apps[1], [], [productRegistration])

      cy.get('[data-testid="submit-registration"]').click()

      cy.get('[data-testid="products-list"]')
      cy.get('[data-testid="products-list"]').should('contain', 'barAPI')
      cy.get('[data-testid="status-badge"]').should('contain', 'approved')
    })

    it('cannot duplicate a registration request', () => {
      cy.mockProductDocument()
      cy.mockProduct()
      cy.mockProductVersionApplicationRegistration(versions[0])
      cy.mockGetProductDocuments(product.id)
      cy.mockProductOperations(product.id, versions[0].id)
      cy.mockProductVersionSpec(product.id, versions[0].id)
      cy.mockRegistrations('*', [])

      cy.viewport(1440, 900)
      cy.visit(`/spec/${product.id}`)

      cy.mockApplications(apps, 3)
      cy.mockProductVersionAvailableRegistrations(product.id, versions[0].id, [apps[2]])

      cy.get('[data-testid="register-button"]', { timeout: 12000 }).click()
      cy.get(selectors.appRegModal).should('exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${apps[0].name}"]`).should('not.exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${apps[1].name}"]`).should('not.exist')
      cy.get(`${selectors.appRegModal} [data-testid="register-${apps[2].name}"]`).should('exist')
    })
  })

  it("can't refresh token of existing application without dcr", () => {
    cy.mockApplications([apps[0]], 1)
    cy.visit('/my-apps')

    cy.get('[data-testid="applications-table"] tbody tr .actions-badge')
      .should('have.length', 1)
      .click()

    cy.get('[data-testid="dropdown-refresh-application-dcr-token"]').should('not.exist')
    cy.get('[data-testid="dropdown-delete-application"]').should('exist')
  })

  it('show credentials table and not dcr secret table if portal is not dcr ', () => {
    cy.mockApplications([{ ...apps[0] }], 1)
    mockApplicationWithCredAndReg({ ...apps[0] })

    cy.intercept('GET', '**/api/v2/portal', {
      dcr_provider_ids: []
    }).as('getPortalContext')

    cy.visit('/my-apps')

    cy.get('[data-testid="applications-table"] tbody tr').click()

    cy.wait('@getPortalContext')

    cy.intercept('POST', `api/v2/applications/${apps[0].id}/refresh-token`, {
      statusCode: 200,
      body: { client_secret: 'SECRET_TOKEN' }
    }).as('refreshToken')

    cy.get('[data-testid="client-secret-table"]').should('not.exist')
    cy.get('[data-testid="client-secret-table"] [data-testid="refresh-secret-button"]').should('not.exist')
    cy.get('.credentials-list').should('exist')
  })

  it('app-reg-v2 - show credentials table if app is keyauth ', () => {
    cy.mockLaunchDarklyFlags([
      {
        name: 'tdx-3531-app-reg-v2',
        value: true
      }
    ])
    const keyAuthApp = {
      ...apps[0],
      auth_strategy: {
        id: 'key-auth-strat-id',
        name: 'keyauthstrat',
        credential_type: AuthStrategyKeyAuthCredentialTypeEnum.KeyAuth
      }
    }

    cy.mockApplications([{ ...keyAuthApp }], 1)
    mockApplicationWithCredAndReg({ ...keyAuthApp })

    cy.visit('/my-apps')

    cy.get('[data-testid="applications-table"] tbody tr').click()

    cy.get('[data-testid="client-secret-table"]').should('not.exist')
    cy.get('[data-testid="client-secret-table"] [data-testid="refresh-secret-button"]').should('not.exist')
    cy.get('.credentials-list').should('exist')
  })
  it('app-reg-v2 - show auth strategy info for key-auth app', () => {
    cy.mockLaunchDarklyFlags([
      {
        name: 'tdx-3531-app-reg-v2',
        value: true
      }
    ])
    const keyAuthApp = {
      ...apps[0],
      auth_strategy: {
        id: 'key-auth-strat-id',
        name: 'keyauthstrat',
        credential_type: AuthStrategyKeyAuthCredentialTypeEnum.KeyAuth,
        key_names: ['key']
      }
    }

    cy.mockApplications([{ ...keyAuthApp }], 1)
    mockApplicationWithCredAndReg({ ...keyAuthApp })

    cy.visit('/my-apps')

    cy.get('[data-testid="applications-table"] tbody tr').click()
    cy.get('[data-testid="auth-strategy-card"]').should('exist')
    cy.get('[data-testid="auth-strategy-auth-methods-label"]').should('not.exist')
    cy.get('[data-testid="auth-strategy-key-names-label"]').should('exist')
    cy.get('[data-testid="auth-strategy-title"]').should('exist').should('contain.text', keyAuthApp.auth_strategy.name)
    keyAuthApp.auth_strategy.key_names.forEach((key) => {
      cy.get(`[data-testid="key-name-${key}"]`).should('exist')
    })
    cy.get('[data-testid="auth-strategy-credential-type"]').should('exist').should('contain.text', 'Key Auth')
  })
  it('app-reg-v2 - does not show any tables if app is oidc ', () => {
    cy.mockLaunchDarklyFlags([
      {
        name: 'tdx-3531-app-reg-v2',
        value: true
      }
    ])
    const oidcApp = {
      ...apps[0],
      auth_strategy: {
        id: 'oidc-strat-id',
        name: 'oidc-strat',
        auth_methods: [
          'client_credentials',
          'session',
          'bearer'
        ],
        credential_type: AuthStrategyClientCredentialsCredentialTypeEnum.SelfManagedClientCredentials
      }
    }

    cy.mockApplications([{ ...oidcApp }], 1)
    mockApplicationWithCredAndReg({ ...oidcApp })

    cy.visit('/my-apps')

    cy.get('[data-testid="applications-table"] tbody tr').click()

    cy.get('[data-testid="client-secret-table"]').should('not.exist')
    cy.get('[data-testid="client-secret-table"] [data-testid="refresh-secret-button"]').should('not.exist')
    cy.get('.credentials-list').should('not.exist')
  })
  it('app-reg-v2 - show auth strategy info for oidc app', () => {
    cy.mockLaunchDarklyFlags([
      {
        name: 'tdx-3531-app-reg-v2',
        value: true
      }
    ])
    const oidcApp = {
      ...apps[0],
      auth_strategy: {
        id: 'oidc-strat-id',
        name: 'oidc-strat',
        auth_methods: [
          'client_credentials',
          'session',
          'bearer'
        ],
        credential_type: AuthStrategyClientCredentialsCredentialTypeEnum.SelfManagedClientCredentials
      }
    }

    cy.mockApplications([{ ...oidcApp }], 1)
    mockApplicationWithCredAndReg({ ...oidcApp })

    cy.visit('/my-apps')

    cy.get('[data-testid="applications-table"] tbody tr').click()
    cy.get('[data-testid="auth-strategy-card"]').should('exist')
    cy.get('[data-testid="auth-strategy-auth-methods-label"]').should('exist')
    cy.get('[data-testid="auth-strategy-key-names-label"]').should('not.exist')
    cy.get('[data-testid="auth-strategy-title"]').should('exist').should('contain.text', oidcApp.auth_strategy.name)
    cy.get('[data-testid="auth-strategy-credential-type"]').should('exist').should('contain.text', 'Self Managed Client Credentials')
    oidcApp.auth_strategy.auth_methods.forEach((method) => {
      cy.get(`[data-testid="auth-method-${method}"]`).should('exist')
    })
  })
  it('app-reg-v2 - show dcr token table if app is DCR ', () => {
    cy.mockLaunchDarklyFlags([
      {
        name: 'tdx-3531-app-reg-v2',
        value: true
      }
    ])
    cy.intercept('POST', `api/v2/applications/${apps[0].id}/refresh-token`, {
      statusCode: 200,
      body: { client_secret: 'SECRET_TOKEN' }
    }).as('refreshToken')

    const dcrApp = {
      ...apps[0],
      auth_strategy: {
        id: 'okta-strat-id',
        name: 'dcr-strat',
        auth_methods: [
          'bearer',
          'client_credentials',
          'session'
        ],
        credential_type: AuthStrategyClientCredentialsCredentialTypeEnum.ClientCredentials
      }
    }

    cy.mockApplications([{ ...dcrApp }], 1)
    mockApplicationWithCredAndReg({ ...dcrApp })

    cy.visit('/my-apps')

    cy.get('[data-testid="applications-table"] tbody tr').click()
    cy.get('.credentials-list').should('not.exist')

    cy.get('[data-testid="client-secret-table"]').should('exist')
    cy.get('[data-testid="client-secret-table"] [data-testid="refresh-secret-button"]').should('exist').click()

    cy.wait('@refreshToken')

    cy.get('.toaster-container-outer .message').should(
      'contain',
      'Successfully refreshed secret'
    )

    cy.get('[data-testid="application-secret-token-modal"]').should('exist')
    cy.get('[data-testid="copy-button"]').should('contain', 'SECRET_TOKEN').click()

    cy.get('.toaster-container-outer .message').should(
      'contain',
      '"SECRET_TOKEN" copied to clipboard'
    )

    cy.get('[data-testid="close-btn"]').click()

    cy.get('[data-testid="application-secret-token-modal"]').should('not.exist')
  })
  it('app-reg-v2 - show auth strategy info for dcr app', () => {
    cy.mockLaunchDarklyFlags([
      {
        name: 'tdx-3531-app-reg-v2',
        value: true
      }
    ])
    const dcrApp = {
      ...apps[0],
      auth_strategy: {
        id: 'okta-strat-id',
        name: 'dcr-strat',
        auth_methods: [
          'bearer',
          'client_credentials',
          'session'
        ],
        credential_type: AuthStrategyClientCredentialsCredentialTypeEnum.ClientCredentials
      }
    }

    cy.mockApplications([{ ...dcrApp }], 1)
    mockApplicationWithCredAndReg({ ...dcrApp })

    cy.visit('/my-apps')

    cy.get('[data-testid="applications-table"] tbody tr').click()
    cy.get('[data-testid="auth-strategy-card"]').should('exist')
    cy.get('[data-testid="auth-strategy-auth-methods-label"]').should('exist')
    cy.get('[data-testid="auth-strategy-title"]').should('exist').should('contain.text', dcrApp.auth_strategy.name)
    cy.get('[data-testid="auth-strategy-credential-type"]').should('exist').should('contain.text', 'Client Credentials')
    dcrApp.auth_strategy.auth_methods.forEach((method) => {
      cy.get(`[data-testid="auth-method-${method}"]`).should('exist')
    })
  })

  describe('Credential management with DCR', () => {
    it('can refresh token of existing application with dcr', () => {
      cy.mockDcrPortal()
      cy.mockApplications([{ ...apps[0] }], 1)
      cy.visit('/my-apps')

      cy.get('[data-testid="applications-table"] tbody tr .actions-badge')
        .should('have.length', 1)
        .click()

      cy.intercept('POST', `api/v2/applications/${apps[0].id}/refresh-token`, {
        statusCode: 200,
        body: { client_secret: 'SECRET_TOKEN' }
      }).as('refreshToken')

      cy.get('[data-testid="dropdown-delete-application"]').should('exist')
      cy.get('[data-testid="dropdown-refresh-application-dcr-token"]').should('exist').click()

      cy.wait('@refreshToken')

      cy.get('.toaster-container-outer .message').should(
        'contain',
        'Successfully refreshed secret'
      )

      cy.get('[data-testid="application-secret-token-modal"]').should('exist')
      cy.get('[data-testid="copy-button"]').should('contain', 'SECRET_TOKEN').click()

      cy.get('.toaster-container-outer .message').should(
        'contain',
        '"SECRET_TOKEN" copied to clipboard'
      )

      cy.get('[data-testid="close-btn"]').click()

      cy.get('[data-testid="application-secret-token-modal"]').should('not.exist')
    })

    it('can refresh token of existing application with dcr from application page', () => {
      cy.mockApplications([{ ...apps[0], created_at: '2022-11-02T18:59:30.789Z' }], 1)
      mockApplicationWithCredAndReg({ ...apps[0], created_at: '2022-11-02T18:59:30.789Z' })
      cy.mockDcrPortal()
      cy.visit('/my-apps')

      cy.get('[data-testid="applications-table"] tbody tr').click()

      cy.intercept('POST', `api/v2/applications/${apps[0].id}/refresh-token`, {
        statusCode: 200,
        body: { client_secret: 'SECRET_TOKEN' }
      }).as('refreshToken')

      cy.wait('@isDcrPortal')

      cy.get('[data-testid="client-secret-table"]').should('exist')
      cy.get('[data-testid="client-secret-table"] [data-testid="refresh-secret-button"]').should('exist').click()

      cy.wait('@refreshToken')

      cy.get('.toaster-container-outer .message').should(
        'contain',
        'Successfully refreshed secret'
      )

      cy.get('[data-testid="application-secret-token-modal"]').should('exist')
      cy.get('[data-testid="copy-button"]').should('contain', 'SECRET_TOKEN').click()

      cy.get('.toaster-container-outer .message').should(
        'contain',
        '"SECRET_TOKEN" copied to clipboard'
      )

      cy.get('[data-testid="close-btn"]').click()

      cy.get('[data-testid="application-secret-token-modal"]').should('not.exist')
    })
  })
})
