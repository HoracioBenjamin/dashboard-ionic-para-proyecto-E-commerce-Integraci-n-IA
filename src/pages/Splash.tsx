import React, { useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SplashLogistics from '../components/SplashLogistics';
import './Splash.css';

const SPLASH_MS = 2800;

const SplashScreen: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    let mounted = true;
    const checkSessionAndNavigate = async () => {
      await new Promise((resolve) => setTimeout(resolve, SPLASH_MS));
      if (!mounted) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      history.push(session ? '/home' : '/login');
    };

    checkSessionAndNavigate();
    return () => {
      mounted = false;
    };
  }, [history]);

  return (
    <IonPage>
      <IonContent scrollY={false}>
        <div className="splash-wrap">
          <motion.div
            className="splash-brand"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <img src="/logo-shoesduoc.svg" alt="ShoesDuoc" />
            <h1>ShoesDuoc</h1>
            <p>WearShop</p>
            <div className="splash-sub">Panel administración · Inventario y despachos</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
            style={{ zIndex: 2 }}
          >
            <SplashLogistics />
          </motion.div>

          <div className="splash-progress" aria-hidden>
            <span />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SplashScreen;
