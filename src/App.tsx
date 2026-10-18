import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Splash from './pages/Splash';
import Login from './pages/Login';
import SubirProductos from './pages/SubirProducto';
import GestionMarcas from './pages/GestionMarcas';
import GestionarCategoria from './pages/GestionarCategoria';
import GestionarStock from './pages/GestionarStock';
import GestionarProductos from './pages/GestionarProductos';
import { AiAssistant } from './components/IA';
import AdminMenu from './components/AdminMenu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

import '@ionic/react/css/palettes/dark.class.css';
/* Paleta oscura manual: solo se activa con la clase
   `ion-palette-dark` (botón sol/luna). Por defecto la app es clara. */

/* Theme variables */
import './theme/variables.css';
import { useEffect } from 'react';
import { initTheme } from './hooks/useTheme';

setupIonicReact();

const AppRoutes: React.FC = () => (
  <IonRouterOutlet id="main">
    <Route exact path="/splash">
      <Splash />
    </Route>

    <Route exact path="/login">
      <Login />
    </Route>

    <Route exact path="/home">
      <Home />
    </Route>

    <Route exact path="/subir-productos" component={SubirProductos} />

    <Route exact path="/gestionar-marcas" component={GestionMarcas} />

    <Route exact path="/gestionar-categorias" component={GestionarCategoria} />

    <Route exact path="/gestionar-stock" component={GestionarStock} />

    <Route exact path="/gestionar-productos" component={GestionarProductos} />

    <Route exact path="/">
      <Redirect to="/splash" />
    </Route>
  </IonRouterOutlet>
);

/** Rutas sin menú lateral (splash / login). */
const BARE_ROUTES = ['/splash', '/login'];

const AppShell: React.FC = () => {
  const location = useLocation();
  const bare = BARE_ROUTES.includes(location.pathname);

  if (bare) {
    return <AppRoutes />;
  }

  return (
    <IonSplitPane contentId="main" when="lg">
      <AdminMenu />
      <AppRoutes />
    </IonSplitPane>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <AppShell />
      </IonReactRouter>
      <AiAssistant />
    </IonApp>
  );
};

export default App;
