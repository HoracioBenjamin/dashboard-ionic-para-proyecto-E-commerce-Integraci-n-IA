import React, { useEffect, useState, useCallback } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonLabel, IonButton, IonIcon, IonButtons, IonBackButton, 
  IonGrid, IonRow, IonCol, IonBadge, useIonAlert, useIonToast, 
  IonSpinner, IonRefresher, IonRefresherContent, IonModal, 
  IonItem, IonInput, IonToggle, useIonLoading
} from '@ionic/react';
import { 
  trashOutline, pencilOutline, saveOutline, 
  closeOutline, addCircleOutline, removeCircleOutline,
  addOutline
} from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import { PLACEHOLDER_IMG } from '../components/placeholder';
import './GestionarStock.css';

const GestionarStock: React.FC = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Panel de Edición
  const [productoAEditar, setProductoAEditar] = useState<any | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();

  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          marcas ( nombre ),
          categorias ( nombre ),
          detalle_tallas:stock (
            id,
            talla,
            cantidad
          )
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
    setProductoAEditar(JSON.parse(JSON.stringify(producto))); 
    setMostrarModal(true);
  };

  const ajustarCantidad = (index: number, delta: number) => {
    if (!productoAEditar) return;
    const nuevasTallas = [...productoAEditar.detalle_tallas];
    const valorActual = parseInt(nuevasTallas[index].cantidad) || 0;
    nuevasTallas[index].cantidad = Math.max(0, valorActual + delta);
    setProductoAEditar({ ...productoAEditar, detalle_tallas: nuevasTallas });
  };

  const agregarNuevaTalla = () => {
    if (!productoAEditar) return;
    const nuevasTallas = [...(productoAEditar.detalle_tallas || [])];
    nuevasTallas.push({ talla: '', cantidad: 0, esNuevo: true });
    setProductoAEditar({ ...productoAEditar, detalle_tallas: nuevasTallas });
  };

  const guardarCambiosRapidos = async () => {
    if (!productoAEditar) return;
    
    await presentLoading('Guardando cambios...');
    try {
      // 1. Actualizar Producto
      const { error: errProd } = await supabase
        .from('productos')
        .update({
          nombre: productoAEditar.nombre,
          precio: productoAEditar.precio,
          en_oferta: productoAEditar.en_oferta,
          precio_oferta: productoAEditar.en_oferta ? productoAEditar.precio_oferta : null
        })
        .eq('id', productoAEditar.id);

      if (errProd) throw errProd;

      // 2. Procesar Tallas
      for (const t of productoAEditar.detalle_tallas) {
        if (t.esNuevo && t.talla.trim() !== '') {
          await supabase.from('stock').insert({
            producto_id: productoAEditar.id,
            talla: t.talla,
            cantidad: t.cantidad
          });
        } else if (!t.esNuevo) {
          await supabase.from('stock')
            .update({ cantidad: t.cantidad, talla: t.talla })
            .eq('id', t.id);
        }
      }

      setMostrarModal(false);
      presentToast({ message: 'Stock actualizado', color: 'success', duration: 2000 });
      cargarProductos(); 
    } catch (error: any) {
      presentToast({ message: 'Error: ' + error.message, color: 'danger' });
    } finally {
      await dismissLoading();
    }
  };

  const confirmarEliminar = (id: number, nombre: string) => {
    presentAlert({
      header: 'Eliminar Producto',
      message: `¿Seguro que deseas eliminar "${nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => ejecutarEliminacion(id) }
      ]
    });
  };

  const ejecutarEliminacion = async (id: number) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) {
      presentToast({ message: 'Error al eliminar', duration: 2500, color: 'danger' });
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
          <IonTitle style={{ fontWeight: 'bold' }}>CONTROL DE STOCK</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding gray-bg">
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}><IonRefresherContent /></IonRefresher>

        {loading ? (
          <div className="ion-text-center ion-padding" style={{ marginTop: '20%' }}>
            <IonSpinner name="crescent" color="primary" /><p>Sincronizando...</p>
          </div>
        ) : (
          <IonList className="transparent-list">
            {productos.map((prod) => {
              const listaTallas = Array.isArray(prod.detalle_tallas) ? prod.detalle_tallas : [];
              const totalUnidades = listaTallas.reduce((sum: number, item: any) => sum + (item.cantidad || 0), 0);

              return (
                <div key={prod.id} className="stock-card animate__animated animate__fadeIn">
                  <IonGrid>
                    <IonRow className="ion-align-items-center">
                      <IonCol size="4">
                        <div className="img-container">
                          <img src={prod.imagen_url || PLACEHOLDER_IMG} alt={prod.nombre} onError={(e: any) => { if (!e.target.src.startsWith('data:')) e.target.src = PLACEHOLDER_IMG; }} />
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
                      <IonCol size="8">
                        <IonLabel>
                          <h2 className="prod-name">{prod.nombre}</h2>
                          <div className="price-container" style={{ margin: '4px 0' }}>
                            {prod.en_oferta ? (
                              <><span className="old-price">${prod.precio.toLocaleString('es-CL')}</span>
                              <span className="offer-price" style={{ marginLeft: '8px', color: '#d32f2f', fontWeight: 'bold' }}>
                                ${prod.precio_oferta.toLocaleString('es-CL')}
                              </span></>
                            ) : (
                              <span className="normal-price" style={{ fontWeight: 'bold' }}>
                                ${prod.precio.toLocaleString('es-CL')}
                              </span>
                            )}
                          </div>
                          <p className="prod-brand">{prod.marcas?.nombre} • {prod.categorias?.nombre}</p>
                          
                          {/* DETALLE DE TALLAS EN LA TARJETA */}
                          <div className="sizes-detail-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                            {listaTallas.map((t: any, idx: number) => (
                              <div key={idx} style={{ fontSize: '0.7rem', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', border: '1px solid #ddd' }}>
                                {t.talla}: <strong>{t.cantidad}</strong>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginTop: '8px' }}>
                            <IonBadge color={totalUnidades > 5 ? "dark" : "danger"}>TOTAL: {totalUnidades} UNID.</IonBadge>
                          </div>
                        </IonLabel>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </div>
              );
            })}
          </IonList>
        )}

        {/* MODAL DE EDICIÓN */}
        <IonModal 
          isOpen={mostrarModal} 
          onDidDismiss={() => setMostrarModal(false)}
          initialBreakpoint={0.85}
          breakpoints={[0, 0.85, 1]}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Producto</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setMostrarModal(false)}><IonIcon icon={closeOutline} /></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {productoAEditar && (
              <div className="edit-form">
                <IonItem mode="md" className="ion-margin-bottom">
                  <IonLabel position="floating">Nombre</IonLabel>
                  <IonInput value={productoAEditar.nombre} onIonInput={e => setProductoAEditar({...productoAEditar, nombre: e.detail.value!})} />
                </IonItem>

                <IonItem mode="md" className="ion-margin-bottom">
                  <IonLabel position="floating">Precio Base ($)</IonLabel>
                  <IonInput type="number" value={productoAEditar.precio} onIonInput={e => setProductoAEditar({...productoAEditar, precio: parseInt(e.detail.value!)})} />
                </IonItem>

                <IonItem lines="none">
                  <IonLabel>Oferta Activa</IonLabel>
                  <IonToggle checked={productoAEditar.en_oferta} onIonChange={e => setProductoAEditar({...productoAEditar, en_oferta: e.detail.checked})} />
                </IonItem>

                {productoAEditar.en_oferta && (
                  <IonItem mode="md" className="ion-margin-top ion-margin-bottom">
                    <IonLabel position="floating">Precio Oferta ($)</IonLabel>
                    <IonInput type="number" value={productoAEditar.precio_oferta} onIonInput={e => setProductoAEditar({...productoAEditar, precio_oferta: parseInt(e.detail.value!)})} />
                  </IonItem>
                )}

                <div className="stock-editor-section" style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontWeight: 'bold', margin: 0 }}>Tallas y Unidades</h3>
                    <IonButton size="small" fill="outline" onClick={agregarNuevaTalla}>
                      <IonIcon icon={addOutline} slot="start" /> Nueva Talla
                    </IonButton>
                  </div>

                  {productoAEditar.detalle_tallas?.map((t: any, index: number) => (
                    <IonGrid key={index} style={{ background: '#f4f4f4', borderRadius: '10px', marginBottom: '8px' }}>
                      <IonRow className="ion-align-items-center">
                        <IonCol size="4">
                          <IonInput 
                            placeholder="Talla" 
                            value={t.talla} 
                            onIonInput={e => {
                              const nuevas = [...productoAEditar.detalle_tallas];
                              nuevas[index].talla = e.detail.value!;
                              setProductoAEditar({...productoAEditar, detalle_tallas: nuevas});
                            }}
                          />
                        </IonCol>
                        <IonCol size="8" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <IonButton fill="clear" color="danger" onClick={() => ajustarCantidad(index, -1)}>
                            <IonIcon icon={removeCircleOutline} slot="icon-only" />
                          </IonButton>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', minWidth: '35px', textAlign: 'center' }}>
                            {t.cantidad}
                          </span>
                          <IonButton fill="clear" color="primary" onClick={() => ajustarCantidad(index, 1)}>
                            <IonIcon icon={addCircleOutline} slot="icon-only" />
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  ))}
                </div>

                <IonButton expand="block" mode="ios" className="ion-margin-top" onClick={guardarCambiosRapidos} style={{ height: '50px' }}>
                  <IonIcon icon={saveOutline} slot="start" />
                  Guardar Todo
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default GestionarStock;