import{a as p,u as d,_ as u}from"./index-0rC--EyN.js";import{d as _,f as l,i as m,j as h,k as c,n as e,t as o,l as s,x as f}from"./vue-N1vwxG77.js";import"./kongponents-juAo2PPt.js";import"./specRenderer-QZkoYPrL.js";const x=_({name:"NotFound",setup(){const{portalApiV2:t}=p(),n=t.value.getApiLink("/api/v2/portal/logo"),a=d().state.helpText.notFound;return{logoSrc:n,helpText:a}}}),g={class:"not-found d-flex flex-column justify-content-center align-items-center","data-testid":"404"},T=["src","alt"],k={class:"circle d-flex align-items-center justify-content-center"},v={class:"message text-center"},y={class:"mb-1 type-xxl"},C={class:"mt-0 type-xxl"};function N(t,n,a,A,B,S){const r=l("router-link"),i=l("Content");return m(),h(i,null,{default:c(()=>[e("section",g,[e("div",null,[e("img",{class:"logo",src:t.logoSrc,alt:t.helpText.logoAlt},null,8,T)]),e("div",k,o(t.helpText.http404),1),e("div",v,[e("h1",y,o(t.helpText.sorryMessage),1),e("h1",C,[s(o(t.helpText.goBack)+" ",1),f(r,{"data-testid":"go-home",to:"/"},{default:c(()=>[s(o(t.helpText.home),1)]),_:1}),s(". ")])])])]),_:1})}const I=u(x,[["render",N],["__scopeId","data-v-502a3671"]]);export{I as default};
