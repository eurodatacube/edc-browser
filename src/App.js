import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import ServiceHandlersInitializer from './components/ServiceHandlersInitializer/ServiceHandlersInitializer';
import AuthProvider from './components/AuthProvider/AuthProvider';
import Map from './components/Map/Map';
import MainPanel from './components/MainPanel/MainPanel';
import AlgorithmsProvider from './components/AlgorithmsProvider/AlgorithmsProvider';
import CollectionsProvider from './components/CollectionsProvider/CollectionsProvider';
import UrlHandler from './components/UrlHandler/UrlHandler';

import './App.scss';
import './default_styles/button.scss';
import './default_styles/input.scss';
import './default_styles/panel.scss';
import './default_styles/dropdown.scss';
import './default_styles/label.scss';

function App() {
  return (
    <UrlHandler>
      <ServiceHandlersInitializer>
        <AuthProvider>
          <div id="app">
            <CollectionsProvider>
              {(collectionsProps) => (
                <>
                  <Map {...collectionsProps} />
                  <AlgorithmsProvider>
                    {(algorithmProps) => <MainPanel {...algorithmProps} {...collectionsProps} />}
                  </AlgorithmsProvider>
                </>
              )}
            </CollectionsProvider>
          </div>
        </AuthProvider>
      </ServiceHandlersInitializer>
    </UrlHandler>
  );
}

export default App;
