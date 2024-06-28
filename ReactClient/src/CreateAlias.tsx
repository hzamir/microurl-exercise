import React, {useState, useEffect, CSSProperties} from 'react';
import styled from "styled-components";
import {safeEncode, useNavigationAndState, isValidAlias, isValidUrl} from './utilities';
import {Button} from './Button';

const inputStyle:CSSProperties = {
    height:'2.0em',
    alignSelf: 'end'
};
const labelStyle:CSSProperties = {
    textAlign: 'right',
    alignSelf: 'end',
    paddingBottom: '6px'
};

type InvalidMessageProps = { show: boolean}
const InvalidUrlWarning = styled.small<InvalidMessageProps>`
    visibility: ${props => props.show ? 'visible' : 'hidden'};
    text-align: left;
    font-style: italic;
    color: red;
    grid-area: firstWarning;
`;

const InvalidAliasWarning = styled(InvalidUrlWarning)`
    grid-area: secondWarning;
`;

const AliasForm = styled.form`
  padding: 20px;
  display: grid;
  grid-template-columns: 8em 1fr 1fr 1fr;
  grid-template-rows: 3em 1em 1em 3em 1em 1em 3em;

  grid-template-areas:
  "firstLabel firstInput firstInput firstInput"
  "firstUnused firstWarning firstWarning firstWarning"
  "firstGap firstGap firstGap firstGap"
  "secondLabel secondInput secondInput secondInput"
  "secondUnused secondWarning secondWarning secondWarning"
  "secondGap secondGap secondGap secondGap"
  "empty submit submit alsoempty"
;
  grid-gap: 5px;
`;

const originalUrlPlaceholder="https://letmegooglethat.com/?q=How+to+fix+a+Jetbrains+Rider+.net+installation+on+Mac"


type AliasInfo        = {original:string, alias:string, microUrl?:string};
type AliasErrorInfo   = {original:string, proposedAlias:string, error:string, status:number};
type OkFunction = (data: AliasInfo) => void;
type ErrorFunction = (data: AliasErrorInfo, status: number) => void;

// reuse
const fetchTemplate = { method: 'POST', headers: { 'Content-Type': 'application/json'} };

type SubmitFunction = (event: React.SyntheticEvent) => Promise<void>;
function generateSubmit(url: string, body: AliasInfo, okfunc: OkFunction, errfunc: ErrorFunction):SubmitFunction {
    return async (event: React.SyntheticEvent) => {

        // prefix necessary when running a dev server rather than built
        // when it is not running from the same origin
        // it must be set in the .env file, should agree with appsettings.yaml ServerUrl
        // todo: single source of truth for ServerUrl and .env
        const prefix = import.meta.env.DEV ? import.meta.env.VITE_API_PREFIX : '';

        event.preventDefault();
        try {
            const response = await fetch(`${prefix}${url}`, {...fetchTemplate, body: safeEncode(body)});
            const data = await response.json();
            if (response.ok)
                okfunc(data as AliasInfo);
            else
                errfunc(data as AliasErrorInfo, response.status);
        } catch (err) {
            console.error(err);  //todo requires more error handling
        }
    };
}


export const DeleteAlias = () => {
    const [navigate, {original, alias}] = useNavigationAndState<AliasInfo>();

    const revokeAlias = generateSubmit(`/api/url/revoke`, {original, alias},
        (data)=>navigate('/deleted', {original, alias: data?.alias}),
        (data,status)=>navigate('/notdeleted', {original, proposedAlias: alias, error: data?.error, status})
    );

    return (
        <>
            <h1>Delete an alias</h1>
            <Button onClick={revokeAlias}>Confirm Deletion of alias {alias}</Button>
        </>
    );
};

export const AliasDeleted = () => {
    const [navigate, {original, alias}] = useNavigationAndState<AliasInfo>();
    return (
        <>
            <h1>Successfully Deleted</h1>
            <p>original: {original}</p>
            <p>alias: {alias}</p>
            <Button onClick={() => navigate('/create')}>Create a new Alias</Button>
            <Button onClick={() => navigate('/delete',  {original,alias})}>Delete again (to watch that fail)</Button>
        </>
    );
};

export const AliasNotDeleted = () => {
    const [navigate, {original, proposedAlias, error, status}] = useNavigationAndState<AliasErrorInfo>();

    return (
        <>
            <h1>Not Deleted</h1>
            <p>original: {original}</p>
            <p>proposedAlias: {proposedAlias}</p>
            <p style={{color: 'red'}}>{status} / {error}</p>
            <Button onClick={() => navigate('/create')}>Acknowledge</Button>
        </>
    );
};

export const AliasNotCreated = () => {
    const [navigate, {original, proposedAlias, error, status}] = useNavigationAndState<AliasErrorInfo>();

    return (
        <>
            <h1>Not Created</h1>
            <p>original: {original}</p>
            <p>proposedAlias: {proposedAlias}</p>
            <p style={{color:'red'}}>{status} / {error}</p>
            <Button onClick={() => navigate('/create')}>Try Again</Button>
        </>
    );
};

export const AliasCreated = () => {
    const [navigate, {original,alias,microUrl}] = useNavigationAndState<AliasInfo>();

    return (
        <>
            <h1>Alias Created</h1>
            <p>original: {original}</p>
            <p>alias: {alias}</p>
            <p>Your new url is: <a title="test url in a new window" href={microUrl} target="_blank" rel="noopener noreferrer">{microUrl}</a></p>
            <Button onClick={()=>navigate('/create')}>Create a new one</Button>
            <Button onClick={()=>navigate('/delete', {original, alias})}>Delete the alias</Button>
        </>
    );
};

export const CreateAlias = () => {
    const [navigate,_] = useNavigationAndState();
    const [originalUrl, setOriginalUrl] = useState('');
    const [alias, setAlias] = useState('');
    const [validUrl, setValidUrl] = useState(false);
    const [validAlias, setValidAlias] = useState(true);
    const [allowBadUrls, setAllowBadUrls] = useState(false);

    // todo: this re-renders redundantly, but the clarity of the dependencies is a better value for this use case for now
    // serious components would never do this
    useEffect(() => setValidUrl(allowBadUrls || isValidUrl(originalUrl)), [originalUrl, allowBadUrls]);

    // seious components would also make use of useCallback, but its always regenerated due to dependencies
    const handleSubmit = generateSubmit(`/api/url/create`, {original:originalUrl, alias},
        (data)=>
        {
            setAlias(data.alias);
            navigate('/created', {original:originalUrl, alias:data.alias, microUrl:data.microUrl})
        },
        (data, status)=>navigate('/notcreated', {original:originalUrl, proposedAlias:alias, error:data.error, status})
    );

    return (
        <AliasForm onSubmit={handleSubmit} >
            <label style={{...labelStyle, gridArea: 'firstLabel'}}>
                Original URL:
            </label>
            <input name={'originalUrl'}
                   placeholder={originalUrlPlaceholder}
                   type="text"
                   value={originalUrl}
                   onChange={(e) => setOriginalUrl(e.target.value)}
                   style={{...inputStyle, gridArea: 'firstInput'}}
            />

            {validUrl ? (
                <label style={{gridArea: 'firstWarning', marginLeft:'-130px'}}>
                    <input type="checkbox" checked={allowBadUrls} onChange={(e) => setAllowBadUrls(e.target.checked)} />
                    Allow bad urls to test API
                </label>
            ) : (
                <InvalidUrlWarning show={!validUrl && !!originalUrl}>Above text is not (yet) a valid URL</InvalidUrlWarning>
            )}
            <label style={{...labelStyle, gridArea: 'secondLabel'}}>
                Alias:
            </label>
            <input name={'alias'}
                   type="text"
                   value={alias}
                   onChange={({target: {value}}) =>
                   {
                       // value = value.trim(); // rather than complain about hard to see spaces suppress them if on the ends
                       setValidAlias(isValidAlias(value));
                       setAlias(value)
                   }
                   }
                   style={{...inputStyle, gridArea: 'secondInput'}}
            />
            <InvalidAliasWarning show={!validAlias}>Alias may only contain A-Z, a-z, minus, and underscore characters</InvalidAliasWarning>
            <Button type="submit" disabled={!validUrl || !validAlias } style={{gridArea:'submit'}}>Submit</Button>
        </AliasForm>
    );
};
