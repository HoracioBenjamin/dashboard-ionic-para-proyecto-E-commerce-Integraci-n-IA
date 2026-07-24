import React, { useEffect, useState, useCallback } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonLabel, IonButton, IonIcon, IonButtons, IonBackButton, 
  IonGrid, IonRow, IonCol, useIonAlert, useIonToast, 
  IonSpinner, IonRefresher, IonRefresherContent, IonFab, IonFabButton
} from '@ionic/react';
import { 
  trashOutline, pencilOutline, addOutline
} from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import { useHistory } from 'react-router-dom';
import './GestionarProductos.css';

const GestionarProductos: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          marcas ( nombre ),
          categorias ( nombre )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductos(data || []);
    } catch (err: any) {
      presentToast({ message: 'Error de carga: ' + err.message, duration: 3000, color: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [presentToast]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const abrirEdicion = (producto: any) => {
    history.push({
      pathname: '/subir-productos',
      state: { producto }
    });
  };

  const crearProducto = () => {
    history.push('/subir-productos');
  };

  const confirmarEliminar = (id: number, nombre: string) => {
    presentAlert({
      header: 'Eliminar Producto',
      message: `¿Seguro que deseas eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => ejecutarEliminacion(id) }
      ]
    });
  };

  const ejecutarEliminacion = async (id: number) => {
    // Primero eliminar stock asociado si la BD no tiene cascade delete
    await supabase.from('stock').delete().eq('producto_id', id);
    const { error } = await supabase.from('productos').delete().eq('id', id);
    
    if (error) {
      presentToast({ message: 'Error al eliminar: ' + error.message, duration: 2500, color: 'danger' });
    } else {
      presentToast({ message: 'Producto eliminado', duration: 2000, color: 'success' });
      cargarProductos();
    }
  };

  const doRefresh = async (event: any) => {
    await cargarProductos();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/home" color="primary" /></IonButtons>
          <IonTitle style={{ fontWeight: 'bold' }}>GESTIONAR PRODUCTOS</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding gray-bg">
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}><IonRefresherContent /></IonRefresher>

        {loading ? (
          <div className="ion-text-center ion-padding" style={{ marginTop: '20%' }}>
            <IonSpinner name="crescent" color="primary" /><p>Cargando productos...</p>
          </div>
        ) : (
          <IonList className="transparent-list">
            {productos.map((prod) => (
              <div key={prod.id} className="stock-card animate__animated animate__fadeIn">
                <IonGrid>
                  <IonRow className="ion-align-items-center">
                    <IonCol size="4">
                      <div className="img-container">
                        <img src={prod.imagen_url || 'https://placehold.jp/150x150.png'} alt={prod.nombre} />
                      </div>
                      <div className="actions-row">
                        <IonButton fill="clear" color="dark" size="small" onClick={() => abrirEdicion(prod)}>
                          <IonIcon icon={pencilOutline} />
                        </IonButton>
                        <IonButton fill="clear" color="danger" size="small" onClick={() => confirmarEliminar(prod.id, prod.nombre)}>
                          <IonIcon icon={trashOutline} />
                        </IonButton>
                      </div>
                    </IonCol>
                    <IonCol size="8" className="col-right">
                      <IonLabel>
                        <h2 className="prod-name">{prod.nombre}</h2>
                        <div className="price-container" style={{ margin: '4px 0' }}>
                          {prod.en_oferta ? (
                            <>
                              <span className="old-price" style={{ textDecoration: 'line-through', color: '#888' }}>
                                ${prod.precio.toLocaleString('es-CL')}
                              </span>
                              <span className="offer-price" style={{ marginLeft: '8px', color: '#d32f2f', fontWeight: 'bold' }}>
                                ${prod.precio_oferta.toLocaleString('es-CL')}
                              </span>
                            </>
                          ) : (
                            <span className="normal-price" style={{ fontWeight: 'bold' }}>
                              ${prod.precio.toLocaleString('es-CL')}
                            </span>
                          )}
                        </div>
                        <p className="prod-brand">{prod.marcas?.nombre} • {prod.categorias?.nombre}</p>
                      </IonLabel>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="dark" onClick={crearProducto}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default GestionarProductos;
