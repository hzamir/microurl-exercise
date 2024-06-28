import {useNavigate, useLocation, To} from "react-router-dom";


// wrap two router hooks into one, navigate safely if send to a route manually without expected state
type MyNavigateFunction = (to: To, stateValue?: unknown) => void;
export function useNavigationAndState<T>():[MyNavigateFunction, T]
{
    const navigate = useNavigate();
    const state    = useLocation().state;
    if (state === undefined) navigate('/');   // navigate to safe route / if state is undefined
    
    return [(to: To, stateValue: unknown) => navigate(to, { state: stateValue }), state];
}

export function safeEncode(o:unknown)
{
    try {
        return JSON.stringify(o)
    } catch(err) {
        console.error(`error encoding`, o);
    }
}

// for testing validity of an alias it is for input purposes. we accept empty string as valid since no explicit alias is always good
const validAliasRegex = /^[a-zA-Z0-9-_]+$/;
export const isValidAlias = (alias: string) => alias === "" || validAliasRegex.test(alias);

export const isValidUrl = (s: string) => {
    try {
      new URL(s);
      return true;  
    } catch (_) {}
    return false;
}