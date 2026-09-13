import React, { useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Asegúrate de que la ruta sea correcta

const SplashScreen: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    const checkSessionAndNavigate = async () => {
      // 1. Esperamos un tiempo para que se luzca la animación (ej: 4 segundos)
      await new Promise(resolve => setTimeout(resolve, 4000));

      // 2. Consultamos la sesión actual en Supabase
      const { data: { session } } = await supabase.auth.getSession();

      // 3. Redirección condicional
      if (session) {
        history.push('/home');
      } else {
        history.push('/login'); // O la ruta que tengas para iniciar sesión
      }
    };

    checkSessionAndNavigate();
  }, [history]);

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div style={{ 
          height: '100vh', 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#002855' 
        }}>
          
          {/* IMAGEN DE FONDO CON ZOOM SUAVE */}
          <motion.img
            src="splash.jpg" 
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 4, 
              ease: "easeOut",
              opacity: { duration: 2 } 
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0
            }}
          />

          {/* CAPA DE OSCURECIMIENTO */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 30, 66, 0.55)', 
            zIndex: 1
          }} />

          {/* CONTENIDO DE TEXTO */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
            style={{ zIndex: 2, position: 'relative', padding: '0 30px' }}
          >
            <h1 style={{ 
              fontWeight: 800, 
              fontSize: '2.5rem', 
              letterSpacing: '0.02em',
              marginBottom: '12px',
              color: '#fff',
              textShadow: '0px 4px 20px rgba(0,0,0,0.7)'
            }}>
              ShoesDuoc
            </h1>
            
            <p style={{ 
              letterSpacing: '0.4em', 
              color: '#FFB800',
              fontWeight: 700,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              margin: 0
            }}>
              WearShop
            </p>
          </motion.div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SplashScreen;