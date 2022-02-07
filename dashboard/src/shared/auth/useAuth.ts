import { useCallback, useContext } from "react";
import { AuthPolicyContext } from "./AuthPolicyContext";
import { isAuthorized } from "./authorization-helpers";
import { ScopeType, Verbs } from "./types";
import { AuthContext } from "./AuthContext";

type IsAuthType = (
  scope: ScopeType,
  resource: string | string[],
  verb: Verbs | Array<Verbs>
) => boolean 

type UseAuthReturnType = [
  IsAuthType,
  () => Promise<boolean>,
  () => Promise<void>,
]

const useAuth = (): UseAuthReturnType => {
  
  const authPolicyContext = useContext(AuthPolicyContext);
  const authContext = useContext(AuthContext)

  const isAuth = useCallback<IsAuthType>(
    (
      scope,
      resource,
      verb
    ) => isAuthorized(authPolicyContext.currentPolicy, scope, resource, verb),
    [authPolicyContext.currentPolicy]
  );


  return [isAuth, authContext.logout, authContext.authenticate];
};

export default useAuth;
