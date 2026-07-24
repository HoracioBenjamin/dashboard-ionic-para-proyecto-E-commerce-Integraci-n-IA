import React, { useState } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonInput, 
  IonButton, 
  IonText, 
  useIonToast, 
  useIonLoading 
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Login.css';
import { supabase } from '../supabaseClient';

const Login: React.FC = () => {
  // Estados para capturar los datos del formulario
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Hooks de Ionic para feedback visual
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const history = useHistory();

  const handleLogin = async () => {
    // Validar que los campos no estén vacíos
    if (!email || !password) {
      presentToast({
        message: 'Por favor, ingresa tu email y contraseña',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      return;
    }

    await presentLoading({
      message: 'Iniciando sesión...',
      spinner: 'circles'
    });

    try {
      // Intento de login con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      await dismissLoading();

      if (error) {
        presentToast({
          message: 'Error: ' + error.message,
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
      } else if (data.user) {
        // Si todo sale bien, redirigimos al Home o Dashboard
        history.push('/home'); 
      }
    } catch (err) {
      await dismissLoading();
      console.error(err);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-background" scrollEvents={true}>
        
        <div className="flex-center-wrapper">
          <div className="login-container">
            
            {/* Nombre de la APP centrado */}
            <h1 className="app-title">Harán</h1>

            {/* Placa Liquid Glass */}
            <div className="glass-box">
              <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '35px', 
                fontFamily: 'serif',
                color: '#000',
                letterSpacing: '0.1em'
              }}>
                INICIAR SESIÓN
              </h2>

              <IonInput 
                className="glass-input"
                label="Email o Usuario"
                labelPlacement="floating"
                fill="outline"
                mode="md"
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
              />

              <IonInput 
                className="glass-input"
                label="Contraseña"
                labelPlacement="floating"
                fill="outline"
                type="password"
                mode="md"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
              />

              <IonButton 
                className="login-button" 
                expand="block" 
                mode="ios"
                onClick={handleLogin}
              >
                Ingresar
              </IonButton>
            </div>

          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Login;