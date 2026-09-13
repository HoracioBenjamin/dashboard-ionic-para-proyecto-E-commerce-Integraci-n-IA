import React, { useState } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonInput, 
  IonButton, 
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

  const handleSignUp = async () => {
    if (!email || !password) {
      presentToast({
        message: 'Por favor, ingresa un email y contraseña para registrarte',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      return;
    }

    await presentLoading({
      message: 'Creando cuenta...',
      spinner: 'circles'
    });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      await dismissLoading();

      if (error) {
        presentToast({
          message: 'Error al registrar: ' + error.message,
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
      } else if (data.user) {
        presentToast({
          message: '¡Cuenta creada! (Revisa tu email si requiere confirmación)',
          duration: 4000,
          color: 'success',
          position: 'bottom'
        });
        // Dependiendo de tu config en Supabase, el usuario podría iniciar sesión automático
        if (data.session) {
          history.push('/home');
        }
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
            <h1 className="app-title">ShoesDuoc</h1>

            {/* Placa Liquid Glass */}
            <div className="glass-box">
              <h2 style={{ 
                textAlign: 'center', 
                marginBottom: '35px', 
                color: '#002855',
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

              <IonButton 
                fill="clear" 
                expand="block" 
                mode="ios"
                onClick={handleSignUp}
                style={{ marginTop: '10px', color: '#333' }}
              >
                Crear Cuenta (Registro)
              </IonButton>
            </div>

          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Login;