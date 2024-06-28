import React, {useState, useEffect, CSSProperties} from 'react';
import styled from "styled-components";
import {safeEncode, useNavigationAndState} from './utilities';
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

type InvalidMessageProps = { show: boolean};
const Invalid = styled.small<InvalidMessageProps>`
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  grid-area: firstWarning;
  text-align: left;
  font-style: italic; 
  color: red;
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
    event.preventDefault();
      try {
          const response = await fetch(url, {...fetchTemplate, body: safeEncode(body)});
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
  const [originalUrl, setOriginalUrl] = useState(originalUrlPlaceholder); // todo replace with blank initial state
  const [alias, setAlias] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [allowBadUrls, setAllowBadUrls] = useState(false);

  useEffect(() => {
      try {
        if(!allowBadUrls)
          new URL(originalUrl);
        setIsValidUrl(true);
      } catch (_) {
        setIsValidUrl(false);
      }
  }, [originalUrl, allowBadUrls]);

  const handleSubmit = generateSubmit(`api/url/create`, {original:originalUrl, alias},
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

      {isValidUrl ? (
        <label style={{gridArea: 'firstWarning', marginLeft:'-130px'}}>
          <input type="checkbox" checked={allowBadUrls} onChange={(e) => setAllowBadUrls(e.target.checked)} />
          Allow bad urls to test API
        </label>
      ) : (
        <Invalid show={!isValidUrl && !!originalUrl}>Above text is not (yet) a valid URL</Invalid>
      )}
      <label style={{...labelStyle, gridArea: 'secondLabel'}}>
        Alias:
      </label>
      <input name={'alias'}
             type="text"
             value={alias}
             onChange={(e) => setAlias(e.target.value)}
             style={{...inputStyle, gridArea: 'secondInput'}}
      />
      <Button type="submit" disabled={!isValidUrl} style={{gridArea:'submit'}}>Submit</Button>
    </AliasForm>
  );
};
