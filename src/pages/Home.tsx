import React from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonButtons,
  IonMenuButton,
  useIonLoading 
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
  cloudUploadOutline, 
  personOutline, 
  settingsOutline, 
  pricetagOutline,
  albumsOutline,
  receiptOutline, 
  shirtOutline, 
  mailOutline, 
  exitOutline,
  cubeOutline
} from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import ThemeToggle from '../components/ThemeToggle';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [presentLoading, dismissLoading] = useIonLoading();

  const handleSignOut = async () => {
    await presentLoading('Cerrando sesión...');
    const { error } = await supabase.auth.signOut();
    await dismissLoading();

    if (!error) {
      history.push('/login'); // Redirigir al login
    } else {
      console.error('Error al cerrar sesión:', error.message);
    }
  };

  const handleNavigate = (path: string) => {
    history.push(path);
  };

  // Definición de los botones para mapear la grilla fácilmente
  const dashboardButtons = [
    { name: 'Subir Productos', icon: cloudUploadOutline, path: '/subir-productos', active: true },
    { name: 'Gestionar Productos', icon: cubeOutline, path: '/gestionar-productos', active: true },
    { name: 'Gestionar Stock', icon: shirtOutline, path: '/gestionar-stock', active: true },
    { name: 'Crear/Gestionar Marcas', icon: pricetagOutline, path: '/gestionar-marcas', active: true },
    { name: 'Crear/Gestionar Categorias', icon: albumsOutline, path: '/gestionar-categorias', active: true },
    { name: 'Ventas/Pedidos', icon: receiptOutline, path: '/ventas', active: true },
    { name: 'Clientes', icon: personOutline, path: '#', active: false },
    { name: 'Mensajes', icon: mailOutline, path: '#', active: false },
    { name: 'Ajustes', icon: settingsOutline, path: '#', active: false },
    { name: 'Cerrar Sesión', icon: exitOutline, action: handleSignOut, active: true, color: 'danger' },
  ];

  return (
    <IonPage>
      {/* Header elegante y minimalista */}
      <IonHeader className="ion-no-border dashboard-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton menu="main-menu" />
          </IonButtons>
          <img
            src="/logo-shoesduoc.svg"
            alt="ShoesDuoc"
            slot="start"
            className="dashboard-header-logo"
          />
          <IonTitle>WearShop HQ</IonTitle>
          <IonButtons slot="end"><ThemeToggle /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content ion-padding">
        {/* Grilla de Botones Estilo Apple */}
        <IonGrid className="dashboard-grid">
          <IonRow>
            {dashboardButtons.map((btn, index) => (
              <IonCol size="6" sizeMd="3" key={index} className="ion-padding-small">
                
                {/* Botón moderno */}
                <button 
                  className={`apple-button ${btn.color === 'danger' ? 'btn-danger' : ''} ${!btn.active ? 'btn-inactive' : ''}`}
                  onClick={btn.action ? btn.action : () => handleNavigate(btn.path)}
                  disabled={!btn.active} // Deshabilitado si no está activo
                >
                  <IonIcon icon={btn.icon} className="apple-icon" />
                  <span className="apple-text">{btn.name}</span>
                  {!btn.active && <span className="coming-soon">Pronto</span>}
                </button>

              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default Home;

