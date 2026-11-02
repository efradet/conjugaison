import React, {useEffect, useState} from 'react';
import {loadStore, saveStore} from './ui/store.js';
import Home from './ui/Home.jsx';
import RunPage from './ui/RunPage.jsx';
import {TablesPage, AidePage} from './ui/Reference.jsx';

const readRoute = () => (window.location.hash.replace(/^#/, '') || '/');

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [store, setStore] = useState(loadStore);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => { setStorageOk(saveStore(store)); }, [store]);
  useEffect(() => {
    const onHash = () => { setRoute(readRoute()); window.scrollTo({top: 0}); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const go = path => { window.location.hash = path; };

  let page;
  const m = route.match(/^\/x\/(conj|gap|voice|compose|test|review)$/);
  const t = route.match(/^\/tables(?:\/(\w+))?$/);
  if (m) page = <RunPage key={m[1]} type={m[1]} store={store} setStore={setStore} go={go}/>;
  else if (t) page = <TablesPage verbId={t[1]} go={go}/>;
  else if (route === '/aide') page = <AidePage go={go}/>;
  else page = <Home store={store} go={go}/>;

  return <>
    {!storageOk && <p className="storage-warning">Ce navigateur ne garde pas les réponses : tu peux travailler, mais rien ne sera sauvegardé.</p>}
    {page}
  </>;
}
