import React, { useState, useEffect } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, 
  IonButton, IonList, IonLabel, IonIcon, IonButtons, IonBackButton, 
  useIonToast, IonCard, IonCardContent, IonSkeletonText, useIonAlert, IonThumbnail
} from '@ionic/react';
import { 
  addOutline, trashOutline, pencilOutline, businessOutline, 
  closeOutline, saveOutline, linkOutline, eyeOutline 
} from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import './GestionMarcas.css';

const GestionMarcas: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [marcas, setMarcas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const placeholderImg = 'https://via.placeholder.com/100?text=No+Log';

  useEffect(() => {
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    setCargando(true);
    const { data, error } = await supabase.from('marcas').select('*').order('nombre');
    if (data) setMarcas(data);
    setCargando(false);
  };

  // Función para generar slug (igual que en categorías para mantener consistencia)
  const generarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') 
      .replace(/[\s_-]+/g, '-')  
      .replace(/^-+|-+$/g, '');   
  };

  const confirmarGuardar = () => {
    if (!nombre.trim()) {
      presentToast({ message: 'El nombre es obligatorio', duration: 2000, color: 'warning' });
      return;
    }

    presentAlert({
      header: editandoId ? 'Confirmar Edición' : 'Confirmar Nueva Marca',
      message: editandoId 
        ? `¿Deseas guardar los cambios para la marca "${nombre}"?` 
        : `¿Deseas registrar la marca "${nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Aceptar', handler: () => ejecutarGuardado() }
      ]
    });
  };

  const ejecutarGuardado = async () => {
    const finalLogoUrl = logoUrl.trim() === '' ? null : logoUrl.trim();
    const slugCalculado = generarSlug(nombre);

    try {
      if (editandoId) {
        const { error } = await supabase
          .from('marcas')
          .update({ 
            nombre: nombre.trim(), 
            logo_url: finalLogoUrl,
            slug: slugCalculado 
          })
          .eq('id', editandoId);
        
        if (error) throw error;
        presentToast({ message: 'Marca actualizada', duration: 2000, color: 'success' });
        setEditandoId(null);
      } else {
        const { error } = await supabase
          .from('marcas')
          .insert([{ 
            nombre: nombre.trim(), 
            logo_url: finalLogoUrl,
            slug: slugCalculado 
          }]);
        
        if (error) throw error;
        presentToast({ message: 'Marca creada con éxito', duration: 2000, color: 'success' });
      }

      setNombre('');
      setLogoUrl('');
      cargarMarcas();
    } catch (err: any) {
      presentToast({ message: 'Error: ' + err.message, duration: 3500, color: 'danger' });
    }
  };

  const prepararEdicion = (marca: any) => {
    setEditandoId(marca.id);
    setNombre(marca.nombre);
    setLogoUrl(marca.logo_url || '');
    const content = document.querySelector('ion-content');
    if (content) content.scrollToTop(500);
  };

  const confirmarEliminar = (id: number, nombreMarca: string) => {
    presentAlert({
      header: 'Eliminar Marca',
      subHeader: nombreMarca,
      message: '¿Estás seguro? Si la marca tiene productos asociados, no se podrá eliminar.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => ejecutarEliminacion(id) }
      ]
    });
  };

  const ejecutarEliminacion = async (id: number) => {
    const { error } = await supabase.from('marcas').delete().eq('id', id);
    if (!error) {
      presentToast({ message: 'Marca eliminada', duration: 2000, color: 'danger' });
      cargarMarcas();
    } else {
      presentToast({ 
        message: 'No se puede eliminar: tiene productos vinculados', 
        duration: 3500, 
        color: 'warning' 
      });
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/home" color="primary" /></IonButtons>
          <IonTitle style={{fontWeight: 'bold'}}>GESTIÓN DE MARCAS</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding gray-bg">
        <IonCard className="upload-card">
          <IonCardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 className="card-title" style={{ margin: 0 }}>
                {editandoId ? 'Editar Marca' : 'Agregar Nueva Marca'}
              </h2>
              {editandoId && (
                <IonButton fill="clear" color="danger" onClick={() => {setEditandoId(null); setNombre(''); setLogoUrl('');}}>
                  <IonIcon icon={closeOutline} slot="icon-only" />
                </IonButton>
              )}
            </div>
            
            <IonItem lines="none" className="input-item ion-margin-bottom">
              <IonInput 
                label="Nombre de la marca" labelPlacement="floating" fill="outline" mode="md"
                value={nombre} onIonInput={e => setNombre(e.detail.value!)}
                placeholder="Ej: Jordan"
              >
                <IonIcon icon={businessOutline} slot="end" />
              </IonInput>
            </IonItem>

            {/* Vista previa del Slug */}
            <div style={{ padding: '0 10px', marginTop: '-10px', marginBottom: '15px' }}>
                <small style={{ color: '#666' }}>Slug de filtro: <strong>{generarSlug(nombre) || '...'}</strong></small>
            </div>

            <IonItem lines="none" className="input-item">
              <IonInput 
                label="URL Logo (Opcional)" labelPlacement="floating" fill="outline" mode="md"
                value={logoUrl} onIonInput={e => setLogoUrl(e.detail.value!)}
                placeholder="https://link-a-imagen.png"
              >
                <IonIcon icon={linkOutline} slot="end" />
              </IonInput>
            </IonItem>

            {/* VISTA PREVIA DEL LOGO */}
            {logoUrl && (
              <div className="url-preview ion-text-center ion-padding-vertical" style={{ background: '#f9f9f9', borderRadius: '10px', marginTop: '15px', border: '1px dashed #ccc' }}>
                 <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px' }}>
                   <IonIcon icon={eyeOutline} /> Vista previa del logo
                 </p>
                 <img 
                  src={logoUrl} 
                  alt="Preview Logo" 
                  style={{ maxHeight: '80px', maxWidth: '150px', objectFit: 'contain' }}
                  onError={(e: any) => { e.target.src = placeholderImg; }}
                 />
              </div>
            )}

            <IonButton expand="block" onClick={confirmarGuardar} className="save-btn ion-margin-top" mode="ios">
              <IonIcon icon={editandoId ? saveOutline : addOutline} slot="start" />
              {editandoId ? 'Guardar Cambios' : 'Crear Marca'}
            </IonButton>
          </IonCardContent>
        </IonCard>

        <div className="list-container">
          <h3 className="list-title" style={{ paddingLeft: '10px' }}>Marcas Registradas</h3>
          
          {cargando ? (
            <IonList>
              {[1,2,3].map(i => (
                <IonItem key={i} lines="full">
                    <IonSkeletonText animated style={{width: '40px', height: '40px', borderRadius: '8px', marginRight: '15px'}} slot="start"/>
                    <IonLabel><IonSkeletonText animated style={{width: '60%'}} /></IonLabel>
                </IonItem>
              ))}
            </IonList>
          ) : (
            <IonList className="custom-list">
              {marcas.map((m) => (
                <IonItem key={m.id} lines="full" className="brand-item ion-margin-bottom" style={{ borderRadius: '12px' }}>
                  <IonThumbnail slot="start">
                    <img 
                      src={m.logo_url || placeholderImg} 
                      alt={`Logo ${m.nombre}`} 
                      style={{ borderRadius: '6px', objectFit: 'contain', background: '#fff' }}
                      onError={(e: any) => { e.target.src = placeholderImg; }}
                    />
                  </IonThumbnail>

                  <IonLabel className="brand-name">
                    <h2 style={{ fontWeight: 'bold' }}>{m.nombre}</h2>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>Slug: {m.slug || 'n/a'}</p>
                  </IonLabel>

                  <IonButtons slot="end">
                    <IonButton color="dark" onClick={() => prepararEdicion(m)}>
                      <IonIcon icon={pencilOutline} slot="icon-only" />
                    </IonButton>
                    <IonButton color="danger" onClick={() => confirmarEliminar(m.id, m.nombre)}>
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </IonButtons>
                </IonItem>
              ))}
            </IonList>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GestionMarcas;  