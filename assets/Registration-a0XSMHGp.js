import{u as h,e as f,s as k,a as A,_ as R}from"./index-0rC--EyN.js";import{d as C,af as v,c as w,ag as x,f as o,i as S,j as q,k as i,t as g,l as m,x as u,n as c,v as b}from"./vue-N1vwxG77.js";import{A as B}from"./AuthCard-1ZCtR4ie.js";import"./kongponents-juAo2PPt.js";import"./specRenderer-QZkoYPrL.js";const N=C({name:"Registration",components:{AuthCard:B},setup(){const e=h().state.helpText,r=v(),p=f(),{authClientConfig:l}=k(p),s=w(()=>l.value.basicAuthEnabled),{portalApiV2:d}=A();function n(){r.push({path:"/login",query:{registered:!0}})}function a(t){return t.full_name=t.fullName,delete t.fullName,t}return x(()=>{s.value||r.push({path:"/login"})}),{registerEndpoint:d.value.getApiLink("/api/v2/developer"),onRegisterSuccess:n,isBasicAuthEnabled:s,wrapRegisterRequest:a,helpText:e}}}),T={id:"kong-auth-register-wrapper"},y={id:"login-encouragement-message",class:"mt-6 text-center"},E={class:"color-text_colors-primary"};function V(e,r,p,l,s,d){const n=o("kong-auth-register"),a=o("KIcon"),t=o("router-link"),_=o("AuthCard");return e.isBasicAuthEnabled?(S(),q(_,{key:0},{"below-card":i(()=>[c("div",y,[c("p",E,[m(g(e.helpText.registration.alreadyCreated)+" ",1),u(t,{to:{name:"login"}},{default:i(()=>[m(g(e.helpText.registration.login)+" ",1),u(a,{color:"var(--text_colors-link)",icon:"forward"})]),_:1})])])]),default:i(()=>[c("div",T,[u(n,{"wrapper-id":"kong-auth-register-wrapper","register-request-endpoint":e.registerEndpoint,"wrap-request":e.wrapRegisterRequest,"register-button-text":"Create Account",onRegisterSuccess:e.onRegisterSuccess},null,8,["register-request-endpoint","wrap-request","onRegisterSuccess"])])]),_:1})):b("",!0)}const M=R(N,[["render",V]]);export{M as default};
