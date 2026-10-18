import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { useTheme } from '../hooks/useTheme';

/** Botón sol/luna para el toolbar superior. */
const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';

  return (
    <IonButton
      fill="clear"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
    >
      <IonIcon slot="icon-only" icon={dark ? sunnyOutline : moonOutline} />
    </IonButton>
  );
};

export default ThemeToggle;
