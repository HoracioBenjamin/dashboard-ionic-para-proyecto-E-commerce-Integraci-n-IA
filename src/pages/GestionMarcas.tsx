import React, { useState, useEffect } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, 
  IonButton, IonList, IonLabel, IonIcon, IonButtons, IonBackButton, IonMenuButton,
  useIonToast, IonCard, IonCardContent, IonSkeletonText, useIonAlert, IonThumbnail
} from '@ionic/react';
import { 
  addOutline, trashOutline, pencilOutline, businessOutline, 
  closeOutline, saveOutline, linkOutline, eyeOutline 
} from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import ImagenCampo from '../components/ImagenCampo';
import { PLACEHOLDER_IMG } from '../components/placeholder';
import ThemeToggle from '../components/ThemeToggle';
import './GestionMarcas.css';

const GestionMarcas: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [slugGuardado, setSlugGuardado] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [portadaUrl, setPortadaUrl] = useState('');
  const [marcas, setMarcas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const placeholderImg = PLACEHOLDER_IMG;

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

  const slugImagen = editandoId ? slugGuardado : generarSlug(nombre);

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
    const finalPortadaUrl = portadaUrl.trim() === '' ? null : portadaUrl.trim();
    const slugCalculado = slugImagen;

    try {
      if (editandoId) {
        const { error } = await supabase
          .from('marcas')
          .update({ 
            nombre: nombre.trim(), 
            logo_url: finalLogoUrl,
            imagen_portada: finalPortadaUrl,
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
            imagen_portada: finalPortadaUrl,
            slug: slugCalculado 
          }]);
        
        if (error) throw error;
        presentToast({ message: 'Marca creada con éxito', duration: 2000, color: 'success' });
      }

      setNombre('');
      setSlugGuardado('');
      setLogoUrl('');
      setPortadaUrl('');
      cargarMarcas();
    } catch (err: any) {
      presentToast({ message: 'Error: ' + err.message, duration: 3500, color: 'danger' });
    }
  };

  const prepararEdicion = (marca: any) => {
    setEditandoId(marca.id);
    setNombre(marca.nombre);
    setSlugGuardado(marca.slug || '');
    setLogoUrl(marca.logo_url || '');
    setPortadaUrl(marca.imagen_portada || '');
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
          <IonButtons slot="start"><IonMenuButton menu="main-menu" /><IonBackButton defaultHref="/home" color="primary" /></IonButtons>
          <IonTitle style={{fontWeight: 'bold'}}>GESTIÓN DE MARCAS</IonTitle>
          <IonButtons slot="end"><ThemeToggle /></IonButtons>
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
                <IonButton fill="clear" color="danger" onClick={() => {setEditandoId(null); setSlugGuardado(''); setNombre(''); setLogoUrl(''); setPortadaUrl('');}}>
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
                <small style={{ color: '#666' }}>Slug de filtro: <strong>{slugImagen || '...'}</strong></small>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '5px' }}>
              <div>
                <ImagenCampo
                  label="URL Logo (Opcional)"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  carpeta="Logo_Marcas"
                  slugBase={slugImagen}
                  previewFit="contain"
                  tituloPreview="Vista previa del logo"
                />
              </div>
              <div>
                <ImagenCampo
                  label="URL Portada revista (Opcional)"
                  value={portadaUrl}
                  onChange={setPortadaUrl}
                  carpeta="Portada_Marcas"
                  slugBase={slugImagen}
                  previewFit="cover"
                  tituloPreview="Vista previa de la portada"
                />
              </div>
            </div>

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
                      onError={(e: any) => { if (!e.target.src.startsWith('data:')) e.target.src = placeholderImg; }}
                    />
                  </IonThumbnail>
                  <IonThumbnail slot="start" title={m.imagen_portada ? 'Con portada' : 'Sin portada'}>
                    <img 
                      src={m.imagen_portada || placeholderImg} 
                      alt={`Portada ${m.nombre}`} 
                      style={{ borderRadius: '6px', objectFit: 'cover', background: '#f4f4f4' }}
                      onError={(e: any) => { if (!e.target.src.startsWith('data:')) e.target.src = placeholderImg; }}
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