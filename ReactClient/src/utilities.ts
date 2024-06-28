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
