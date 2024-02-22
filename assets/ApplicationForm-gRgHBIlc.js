import{u as re,e as de,s as pe,g as ce,a as ue,c as me,_ as fe}from"./index-0rC--EyN.js";import{d as he,a as g,D as ge,af as ve,c as K,o as ye,f as y,i as _,j as z,k as o,n as m,x as l,v as R,l as s,t as i,J as Ce,q as j,S as be,U as Ee}from"./vue-N1vwxG77.js";import{P as Te}from"./PageTitle-0cJCpiGE.js";import{C as Se}from"./CopyButton-N5Gd094k.js";import{F as De}from"./feature-flags-wWQZYrRa.js";import{f as _e}from"./fetchAll-gydFt7zS.js";import{u as Ae,c as Ie}from"./useMachine-EefTuzQI.js";import"./kongponents-juAo2PPt.js";import"./specRenderer-QZkoYPrL.js";var O,Ve=new Uint8Array(16);function Le(){if(!O&&(O=typeof crypto<"u"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||typeof msCrypto<"u"&&typeof msCrypto.getRandomValues=="function"&&msCrypto.getRandomValues.bind(msCrypto),!O))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return O(Ve)}const Me=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;function ke(e){return typeof e=="string"&&Me.test(e)}var p=[];for(var G=0;G<256;++G)p.push((G+256).toString(16).substr(1));function Ke(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:0,v=(p[e[a+0]]+p[e[a+1]]+p[e[a+2]]+p[e[a+3]]+"-"+p[e[a+4]]+p[e[a+5]]+"-"+p[e[a+6]]+p[e[a+7]]+"-"+p[e[a+8]]+p[e[a+9]]+"-"+p[e[a+10]]+p[e[a+11]]+p[e[a+12]]+p[e[a+13]]+p[e[a+14]]+p[e[a+15]]).toLowerCase();if(!ke(v))throw TypeError("Stringified UUID is invalid");return v}function Re(e,a,v){e=e||{};var c=e.random||(e.rng||Le)();if(c[6]=c[6]&15|64,c[8]=c[8]&63|128,a){v=v||0;for(var h=0;h<16;++h)a[v+h]=c[h];return a}return Ke(c)}function X(e){const a={};return Object.entries(e).forEach(([v,c])=>{c&&(a[v]=c)}),a}const we=he({name:"ApplicationForm",components:{PageTitle:Te,CopyButton:Se},setup(){function e(t){const n={name:"",description:"",redirect_uri:"",reference_id:"",auth_strategy_id:""};return t?delete n.reference_id:delete n.redirect_uri,n}const a=re().state.helpText,v=de(),{isDcr:c}=pe(v),h=g(""),J=g(""),U=g(""),w=g(""),b=g(""),D=g(!1),C=ce(De.AppRegV2,!1),f=g([]),E=g(!1),A=g(!1),I=g(!1),V=g(!0),u=e(c.value),r=g(u),{notify:F}=me(),L=ge(),W=ve(),{state:$,send:T}=Ae(Ie({predictableActionArguments:!0,id:"applicationFormMachine",initial:"idle",states:{idle:{on:{CLICKED_SUBMIT:"pending",FETCH:"pending",CLICKED_DELETE:"confirm_delete"}},pending:{on:{RESOLVE:"success",REJECT:"error"}},success:{on:{CLICKED_SUBMIT:"pending",CLICKED_DELETE:"confirm_delete"}},error:{on:{CLICKED_SUBMIT:"pending"}},confirm_delete:{on:{CLICKED_DELETE:"pending",CLICKED_CANCEL:"idle"}}}})),Q=K(()=>{var t,n;return!$.value.matches("pending")&&r.value.name.length&&(C&&N.value!=="edit"?I.value:!0)&&(C?E.value||((t=r.value.reference_id)==null?void 0:t.length):c.value||((n=r.value.reference_id)==null?void 0:n.length))}),Y=K(()=>{var t;return`Delete ${(t=r.value)==null?void 0:t.name}`}),M=K(()=>L.params.application_id),N=K(()=>M.value?"edit":"create"),Z=K(()=>N.value==="create"?ae:ne),x=K(()=>({edit:$.value.matches("pending")?"Submitting":"Update",create:$.value.matches("pending")?"Submitting":"Create"})[N.value]),{portalApiV2:B}=ue();ye(async()=>{const t=[];if(M.value?t.push(ie()):t.push("_"),C){V.value=!0,t.push(_e(n=>B.value.service.applicationsApi.listApplicationAuthStrategies(n)));try{const[n,d]=await Promise.all(t);d.length&&(I.value=!0,f.value=d.map(S=>({label:S.name,value:S.id,isDcr:S.credential_type==="client_credentials",isSelfManaged:S.credential_type==="self_managed_client_credentials",selected:r.value.auth_strategy_id?S.id===r.value.auth_strategy_id:S.id===L.query.auth_strategy_id||!1})));const k=d.length===1?f.value[0]:f.value.find(S=>S.selected===!0);k&&(r.value.auth_strategy_id=k.value,E.value=k.isDcr,A.value=k.isSelfManaged),V.value=!1}catch(n){V.value=!1,F({appearance:"danger",message:`Error fetching application auth strategies: ${n}`})}}else await Promise.all(t)});const ee=(t,n)=>{t(n)||F({appearance:"danger",message:a.copyButton.copyFailed.start+"id"+a.copyButton.copyFailed.end}),F({message:a.copyButton.copySucceeded.start+n+a.copyButton.copySucceeded.end})},te=t=>{const n=f.value.find(d=>d.value===t.value);n&&(r.value.auth_strategy_id=n.value,E.value=n.isDcr,A.value=n.isSelfManaged)},ae=()=>{T("CLICKED_SUBMIT"),h.value="",C&&(E.value?delete r.value.reference_id:delete r.value.redirect_uri),B.value.service.applicationsApi.createApplication({createApplicationPayload:X(r.value)}).then(t=>{var n,d;!C&&c.value||C&&E.value?(D.value=!0,w.value=t.data.id,b.value=t.data.name,U.value=(n=t.data.credentials)==null?void 0:n.client_id,J.value=(d=t.data.credentials)==null?void 0:d.client_secret):P(t.data.id,t.data.name,"created")}).catch(t=>q(t))},ne=()=>{T("CLICKED_SUBMIT"),h.value="",delete r.value.auth_strategy_id,B.value.service.applicationsApi.updateApplication({applicationId:M.value,updateApplicationPayload:X(r.value)}).then(t=>P(t.data.id,t.data.name,"updated")).catch(t=>q(t))},le=()=>{h.value="",B.value.service.applicationsApi.deleteApplication({applicationId:M.value}).then(()=>P("","","deleted")).catch(t=>q(t))},ie=async()=>(T("FETCH"),B.value.service.applicationsApi.getApplication({applicationId:M.value}).then(t=>{var d;T("RESOLVE");const n={...r.value,name:t.data.name,description:t.data.description||"",redirect_uri:t.data.redirect_uri,reference_id:t.data.reference_id,auth_strategy_id:(d=t.data.auth_strategy)==null?void 0:d.id};c.value?delete n.reference_id:delete n.redirect_uri,r.value=n}).catch(t=>q(t))),oe=()=>{T("CLICKED_CANCEL"),D.value=!1,P(w.value,b.value,"created")},se=(t,n)=>t?L.query.product&&L.query.product_version?{name:"spec",params:{product:L.query.product,product_version:L.query.product_version},query:{application:n}}:{path:`/application/${t}`}:{path:"/my-apps"},P=(t,n,d)=>{T("RESOLVE"),F({message:`Application successfully ${d}`}),W.push(se(t,n))},q=t=>{const{data:n}=t.response,d=n.invalid_parameters&&n.invalid_parameters.length&&n.invalid_parameters||n.detail||t.detail;if(T("REJECT"),Array.isArray(d)){h.value=d.map(k=>k.reason).join(", ");return}h.value=d};return{modalTitle:Y,currentState:$,formData:r,errorMessage:h,isEnabled:Q,id:M,isDcr:c,clientSecret:J,clientId:U,copyTokenToClipboard:ee,fetchingAuthStrategies:V,secretModalIsVisible:D,handleAcknowledgeSecret:oe,hasAppAuthStrategies:I,appRegV2Enabled:C,send:T,buttonText:x,formMode:N,formMethod:Z,handleDelete:le,handleCancel:()=>{W.back()},generateReferenceId:()=>{r.value.reference_id=Re()},helpText:a,appAuthStrategies:f,onChangeAuthStrategy:te,appIsDcr:E,appIsSelfManaged:A}}}),H=e=>(be("data-v-8dbaa090"),e=e(),Ee(),e),Be={class:"w-1/2 mx-auto"},Ue={class:"text-sm mb-5"},Fe=H(()=>m("span",{class:"text-danger"},"*",-1)),$e={class:"mb-5"},Ne=H(()=>m("span",{class:"text-danger"},"*",-1)),Pe={key:0,class:"mb-5"},qe=H(()=>m("span",{class:"text-danger"},"*",-1)),je={key:1,class:"mb-5"},Oe={key:2,class:"mb-5"},He=H(()=>m("span",{class:"text-danger"},"*",-1)),Je={class:"d-flex"},ze={class:"mb-5"},Ge={class:"flex"},We={class:"flex-1"},Xe={key:0};function Qe(e,a,v,c,h,J){const U=y("PageTitle"),w=y("KAlert"),b=y("KLabel"),D=y("KInput"),C=y("KSelect"),f=y("KButton"),E=y("KTextArea"),A=y("KModal"),I=y("CopyButton"),V=y("Content");return _(),z(V,null,{default:o(()=>[m("div",Be,[l(U,{title:e.$route.meta.title,class:"mb-5"},null,8,["title"]),e.currentState.matches("error")?(_(),z(w,{key:0,appearance:"danger",class:"mb-5","alert-message":e.errorMessage},null,8,["alert-message"])):R("",!0),m("div",null,[m("p",Ue,[Fe,s(" "+i(e.helpText.application.reqField),1)]),e.appRegV2Enabled&&!e.hasAppAuthStrategies&&!e.fetchingAuthStrategies&&e.formMode==="create"?(_(),z(w,{key:0,"alert-message":e.helpText.application.authStrategyWarning,appearance:"warning",class:"no-auth-strategies-warning","data-testid":"no-auth-strategies-warning"},null,8,["alert-message"])):R("",!0),m("form",{onSubmit:a[5]||(a[5]=Ce((...u)=>e.formMethod&&e.formMethod(...u),["prevent"]))},[m("div",$e,[l(b,{for:"applicationName"},{default:o(()=>[s(i(e.helpText.application.applicationName)+" ",1),Ne]),_:1}),l(D,{id:"applicationName",modelValue:e.formData.name,"onUpdate:modelValue":a[0]||(a[0]=u=>e.formData.name=u),modelModifiers:{trim:!0},"data-testid":"application-name-input",type:"text",class:"k-input--full"},null,8,["modelValue"])]),e.appAuthStrategies.length>1?(_(),j("div",Pe,[l(b,{for:"authStrat"},{default:o(()=>[s(i(e.helpText.application.authStrategy)+" ",1),qe]),_:1}),l(C,{id:"authStrat",items:e.appAuthStrategies,disabled:e.formMode==="edit","data-testid":"application-auth-strategy-select",appearance:"select",width:"100%",onChange:e.onChangeAuthStrategy},null,8,["items","disabled","onChange"])])):R("",!0),!e.appRegV2Enabled&&e.isDcr||e.appRegV2Enabled&&e.appIsDcr||e.appRegV2Enabled&&e.appIsSelfManaged?(_(),j("div",je,[l(b,{for:"redirectUri"},{default:o(()=>[s(i(e.helpText.application.redirectUriLabel),1)]),_:1}),l(D,{id:"redirectUri",modelValue:e.formData.redirect_uri,"onUpdate:modelValue":a[1]||(a[1]=u=>e.formData.redirect_uri=u),type:"text",class:"w-100 k-input--full"},null,8,["modelValue"])])):R("",!0),!e.appRegV2Enabled&&!e.isDcr||e.appRegV2Enabled&&!e.appIsDcr?(_(),j("div",Oe,[l(b,{for:"referenceId"},{default:o(()=>[s(i(e.helpText.application.form.referenceId.label)+" ",1),He]),_:1}),m("div",Je,[l(D,{id:"referenceId",modelValue:e.formData.reference_id,"onUpdate:modelValue":a[2]||(a[2]=u=>e.formData.reference_id=u),"data-testid":"reference-id-input",type:"text",class:"k-input--full",placeholder:e.helpText.application.form.referenceId.placeholder,help:e.helpText.application.form.referenceId.help},null,8,["modelValue","placeholder","help"]),l(f,{class:"generate-reference-id-button","data-testid":"generate-reference-id","is-rounded":!1,appearance:"secondary",size:"small",onClick:e.generateReferenceId},{default:o(()=>[s(i(e.helpText.application.form.referenceId.generate),1)]),_:1},8,["onClick"])])])):R("",!0),m("div",ze,[l(b,{for:"description"},{default:o(()=>[s(i(e.helpText.application.description),1)]),_:1}),l(E,{id:"description",modelValue:e.formData.description,"onUpdate:modelValue":a[3]||(a[3]=u=>e.formData.description=u),modelModifiers:{trim:!0},rows:5,class:"k-input--full"},null,8,["modelValue"])]),m("div",Ge,[m("div",We,[l(f,{"is-rounded":!1,type:"submit",appearance:"primary",class:"mr-4",disabled:e.isEnabled?null:!0},{default:o(()=>[s(i(e.buttonText),1)]),_:1},8,["disabled"]),l(f,{"is-rounded":!1,appearance:"secondary",onClick:e.handleCancel},{default:o(()=>[s(i(e.helpText.application.cancel),1)]),_:1},8,["onClick"])]),e.formMode==="edit"?(_(),j("div",Xe,[l(f,{"data-testid":"application-delete-button",appearance:"danger","is-rounded":!1,onClick:a[4]||(a[4]=u=>e.send("CLICKED_DELETE"))},{default:o(()=>[s(i(e.helpText.application.delete),1)]),_:1})])):R("",!0)])],32)])]),l(A,{title:e.modalTitle,"is-visible":e.currentState.matches("confirm_delete"),"data-testid":"application-delete-modal","action-button-text":e.helpText.application.delete,"action-button-appearance":"danger",class:"delete-modal",onCanceled:a[7]||(a[7]=u=>e.send("CLICKED_CANCEL"))},{"header-content":o(()=>[s(i(e.modalTitle),1)]),"body-content":o(()=>[s(i(e.helpText.application.confirmDelete(e.formData.name)),1)]),"footer-content":o(()=>[l(f,{"is-rounded":!1,appearance:"danger","data-testid":"application-delete-confirm-button",class:"mr-3",onClick:e.handleDelete},{default:o(()=>[s(i(e.helpText.application.delete),1)]),_:1},8,["onClick"]),l(f,{appearance:"secondary","is-rounded":!1,"data-testid":"application-delete-cancel-button",onClick:a[6]||(a[6]=u=>e.send("CLICKED_CANCEL"))},{default:o(()=>[s(i(e.helpText.application.cancel),1)]),_:1})]),_:1},8,["title","is-visible","action-button-text"]),l(A,{title:e.helpText.application.applicationCredentials,"is-visible":e.secretModalIsVisible,"data-testid":"copy-secret-modal","action-button-text":e.helpText.application.delete,"action-button-appearance":"danger",class:"application-secret-modal",onCanceled:a[8]||(a[8]=u=>e.send("CLICKED_CANCEL"))},{"header-content":o(()=>[s(i(e.helpText.application.applicationSecret),1)]),"body-content":o(()=>[s(i(e.helpText.application.headerDescription1),1),m("strong",null,i(e.formData.name),1),s(" "+i(e.helpText.application.headerDescription2),1),m("strong",null,i(e.helpText.application.headerDescription3),1),s(" "+i(e.helpText.application.headerDescription4)+" ",1),l(I,{label:e.helpText.application.clientID,"text-to-copy":e.clientId},null,8,["label","text-to-copy"]),l(I,{label:e.helpText.application.clientSecret,"text-to-copy":e.clientSecret},null,8,["label","text-to-copy"])]),"footer-content":o(()=>[l(f,{"is-rounded":!1,appearance:"primary","data-testid":"close-application-secret-modal",onClick:e.handleAcknowledgeSecret},{default:o(()=>[s(i(e.helpText.application.proceed),1)]),_:1},8,["onClick"])]),_:1},8,["title","is-visible","action-button-text"])]),_:1})}const rt=fe(we,[["render",Qe],["__scopeId","data-v-8dbaa090"]]);export{rt as default};
