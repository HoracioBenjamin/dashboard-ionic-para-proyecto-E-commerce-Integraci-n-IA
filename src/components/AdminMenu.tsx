import React from 'react';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonListHeader,
  IonItem,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { menuController } from '@ionic/core';
import {
  gridOutline,
  shirtOutline,
  receiptOutline,
  personOutline,
  cloudUploadOutline,
  cubeOutline,
  pricetagOutline,
  albumsOutline,
  mailOutline,
  chatbubbleEllipsesOutline,
  timeOutline,
  sparklesOutline,
} from 'ionicons/icons';
import './AdminMenu.css';

interface MenuEntry {
  label: string;
  icon: string;
  path?: string;
  soon?: boolean;
}

interface MenuSection {
  title: string;
  entries: MenuEntry[];
}

const SECTIONS: MenuSection[] = [
  {
    title: 'Métricas',
    entries: [
      { label: 'Panel principal', icon: gridOutline, path: '/home' },
      { label: 'Control de stock', icon: shirtOutline, path: '/gestionar-stock' },
      { label: 'Ventas / Pedidos', icon: receiptOutline, path: '/ventas' },
      { label: 'Clientes', icon: personOutline, soon: true },
    ],
  },
  {
    title: 'Administrar página',
    entries: [
      { label: 'Subir productos', icon: cloudUploadOutline, path: '/subir-productos' },
      { label: 'Gestionar productos', icon: cubeOutline, path: '/gestionar-productos' },
      { label: 'Marcas', icon: pricetagOutline, path: '/gestionar-marcas' },
      { label: 'Categorías', icon: albumsOutline, path: '/gestionar-categorias' },
      { label: 'Mensajes', icon: mailOutline, soon: true },
    ],
  },
  {
    title: 'Administrar IA',
    entries: [
      { label: 'Abrir asistente', icon: chatbubbleEllipsesOutline, soon: true },
      { label: 'Historial de chats', icon: timeOutline, soon: true },
      { label: 'Configuración IA', icon: sparklesOutline, soon: true },
    ],
  },
];

/** Panel lateral de administración (sidebar en escritorio, drawer en móvil). */
const AdminMenu: React.FC = () => {
  const location = useLocation();

  const close = () => {
    menuController.close('main-menu');
  };

  return (
    <IonMenu side="start" menuId="main-menu" contentId="main" className="admin-menu">
      <IonHeader className="ion-no-border">
        <IonToolbar className="admin-menu-toolbar">
          <img src="/logo-shoesduoc.svg" alt="ShoesDuoc" className="admin-menu-logo" />
          <div className="admin-menu-brand">
            <span>Panel administración</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="admin-menu-content">
        {SECTIONS.map((section) => (
          <IonList key={section.title} lines="none" className="admin-menu-section">
            <IonListHeader className="admin-menu-section-title">{section.title}</IonListHeader>
            {section.entries.map((entry) => {
              const active = !!entry.path && location.pathname === entry.path;
              return (
                <IonItem
                  key={entry.label}
                  button={!entry.soon}
                  routerLink={entry.soon ? undefined : entry.path}
                  routerDirection="root"
                  detail={false}
                  disabled={entry.soon}
                  onClick={close}
                  className={`admin-menu-item${active ? ' active' : ''}`}
                >
                  <IonIcon slot="start" icon={entry.icon} />
                  {entry.label}
                  {entry.soon && (
                    <IonBadge slot="end" className="admin-menu-soon">
                      Pronto
                    </IonBadge>
                  )}
                </IonItem>
              );
            })}
          </IonList>
        ))}
      </IonContent>
    </IonMenu>
  );
};

export default AdminMenu;
