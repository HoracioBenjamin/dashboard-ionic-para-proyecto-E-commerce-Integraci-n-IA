import React, { useState, useEffect } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonInput, IonButton, IonBackButton, IonButtons, IonMenuButton,
  useIonToast, useIonLoading, IonIcon, IonCard, IonCardContent,
  IonList, IonLabel, useIonAlert, IonSkeletonText, IonThumbnail
} from '@ionic/react';
import { gridOutline, addOutline, trashOutline, pencilOutline, saveOutline, closeOutline, linkOutline, eyeOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import ImagenCampo from '../components/ImagenCampo';
import { PLACEHOLDER_IMG } from '../components/placeholder';
import ThemeToggle from '../components/ThemeToggle';
import './GestionarCategoria.css';

const GestionarCategoria: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [slugGuardado, setSlugGuardado] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [portadaUrl, setPortadaUrl] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();
  const [presentAlert] = useIonAlert();

  const placeholderImg = PLACEHOLDER_IMG;

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (data) setCategorias(data);
    setCargando(false);
  };

  // Función para generar el SLUG automáticamente
  const generarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Elimina caracteres especiales
      .replace(/[\s_-]+/g, '-')  // Reemplaza espacios y guiones bajos por un solo guion
      .replace(/^-+|-+$/g, '');   // Elimina guiones al inicio o final
  };

  const slugImagen = editandoId ? slugGuardado : generarSlug(nombre);

  const confirmarGuardar = () => {
    if (!nombre.trim()) {
      presentToast({ message: 'El nombre es obligatorio', duration: 2000, color: 'warning' });
      return;
    }

    presentAlert({
      header: editandoId ? 'Confirmar Edición' : 'Nueva Categoría',
      message: `¿Deseas ${editandoId ? 'actualizar' : 'crear'} la categoría "${nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Aceptar', handler: () => ejecutarGuardado() }
      ]
    });
  };

  const ejecutarGuardado = async () => {
    await presentLoading('Procesando...');
    const finalImgUrl = imagenUrl.trim() === '' ? null : imagenUrl.trim();
    const finalPortadaUrl = portadaUrl.trim() === '' ? null : portadaUrl.trim();
    const slugCalculado = slugImagen;

    try {
      if (editandoId) {
        const { error } = await supabase
          .from('categorias')
          .update({ 
            nombre: nombre.trim(), 
            imagen_url: finalImgUrl,
            imagen_portada: finalPortadaUrl,
            slug: slugCalculado 
          })
          .eq('id', editandoId);
        if (error) throw error;
        setEditandoId(null);
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert([{ 
            nombre: nombre.trim(), 
            imagen_url: finalImgUrl,
            imagen_portada: finalPortadaUrl,
            slug: slugCalculado 
          }]);
        if (error) throw error;
      }

      presentToast({ message: 'Categoría guardada con éxito', duration: 2000, color: 'success' });
      setNombre('');
      setSlugGuardado('');
      setImagenUrl('');
      setPortadaUrl('');
      cargarCategorias();
    } catch (err: any) {
      presentToast({ message: 'Error: ' + err.message, duration: 4000, color: 'danger' });
    } finally {
      await dismissLoading();
    }
  };

  const prepararEdicion = (cat: any) => {
    setEditandoId(cat.id);
    setNombre(cat.nombre);
    setSlugGuardado(cat.slug || '');
    setImagenUrl(cat.imagen_url || '');
    setPortadaUrl(cat.imagen_portada || '');
    const content = document.querySelector('ion-content');
    if (content) content.scrollToTop(500);
  };

  const confirmarEliminar = (id: number, nombreCat: string) => {
    presentAlert({
      header: 'Eliminar Categoría',
      subHeader: nombreCat,
      message: '¿Estás seguro? Se perderá el vínculo con los productos.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => ejecutarEliminacion(id) }
      ]
    });
  };

  const ejecutarEliminacion = async (id: number) => {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (error) {
      presentToast({ message: 'No se puede eliminar: categoría en uso', duration: 3000, color: 'warning' });
    } else {
      presentToast({ message: 'Categoría eliminada', duration: 2000, color: 'danger' });
      cargarCategorias();
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton menu="main-menu" /><IonBackButton defaultHref="/home" color="primary" /></IonButtons>
          <IonTitle style={{ fontWeight: 'bold' }}>GESTIONAR CATEGORÍAS</IonTitle>
          <IonButtons slot="end"><ThemeToggle /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding gray-bg">
        <div className="container">
          
          <IonCard className="category-card">
            <IonCardContent>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="title" style={{ margin: 0 }}>{editandoId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                {editandoId && (
                  <IonButton fill="clear" color="danger" onClick={() => {setEditandoId(null); setSlugGuardado(''); setNombre(''); setImagenUrl(''); setPortadaUrl('');}}>
                    <IonIcon icon={closeOutline} slot="icon-only" />
                  </IonButton>
                )}
              </div>
              
              <IonItem lines="none" className="input-item ion-margin-top">
                <IonInput 
                  label="Nombre de categoría" labelPlacement="floating" fill="outline" mode="md"
                  value={nombre} onIonInput={e => setNombre(e.detail.value!)}
                  placeholder="Ej: Calzado Deportivo"
                >
                  <IonIcon icon={gridOutline} slot="end" />
                </IonInput>
              </IonItem>

              {/* Muestra una vista previa del Slug mientras escribes */}
              <div style={{ padding: '0 10px', marginTop: '-5px', marginBottom: '10px' }}>
                <small style={{ color: '#666' }}>URL amigable: <strong>{slugImagen || '...'}</strong></small>
              </div>

              <ImagenCampo
                label="URL Logo (Opcional)"
                value={imagenUrl}
                onChange={setImagenUrl}
                carpeta="Logo_Categorias"
                slugBase={slugImagen}
                previewFit="cover"
                tituloPreview="Vista previa del logo"
              />

              <h3 style={{ marginTop: '20px', marginBottom: '10px', fontWeight: 600 }}>Portada de la categoría</h3>
              <ImagenCampo
                label="URL Portada revista (Opcional)"
                value={portadaUrl}
                onChange={setPortadaUrl}
                carpeta="Portada_Categorias"
                slugBase={slugImagen}
                previewFit="cover"
                tituloPreview="Vista previa de la portada"
              />

              <IonButton expand="block" className="main-btn ion-margin-top" onClick={confirmarGuardar} mode="ios">
                <IonIcon icon={editandoId ? saveOutline : addOutline} slot="start" />
                {editandoId ? 'Guardar Cambios' : 'Crear Categoría'}
              </IonButton>
            </IonCardContent>
          </IonCard>

          <div className="list-section">
            <h3 className="section-label">Categorías actuales</h3>
            
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
              <IonList className="transparent-list">
                {categorias.map((cat) => (
                  <IonItem key={cat.id} lines="full" className="item-bg ion-margin-bottom" style={{ borderRadius: '12px' }}>
                    <IonThumbnail slot="start">
                      <img 
                        src={cat.imagen_url || placeholderImg} 
                        alt={cat.nombre} 
                        style={{ borderRadius: '8px' }}
                        onError={(e: any) => { if (!e.target.src.startsWith('data:')) e.target.src = placeholderImg; }}
                      />
                    </IonThumbnail>

                    <IonThumbnail slot="start" title={cat.imagen_portada ? 'Con portada' : 'Sin portada'}>
                      <img
                        src={cat.imagen_portada || placeholderImg}
                        alt={`Portada ${cat.nombre}`}
                        style={{ borderRadius: '8px', objectFit: 'cover', background: '#f4f4f4' }}
                        onError={(e: any) => { if (!e.target.src.startsWith('data:')) e.target.src = placeholderImg; }}
                      />
                    </IonThumbnail>

                    <IonLabel className="cat-name">
                      <h2 style={{ fontWeight: 'bold' }}>{cat.nombre}</h2>
                      <p style={{ fontSize: '0.8rem', color: '#888' }}>/{cat.slug}</p>
                    </IonLabel>
                    
                    <IonButtons slot="end">
                      <IonButton color="dark" onClick={() => prepararEdicion(cat)}>
                        <IonIcon icon={pencilOutline} slot="icon-only" />
                      </IonButton>
                      <IonButton color="danger" onClick={() => confirmarEliminar(cat.id, cat.nombre)}>
                        <IonIcon icon={trashOutline} slot="icon-only" />
                      </IonButton>
                    </IonButtons>
                  </IonItem>
                ))}
              </IonList>
            )}
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default GestionarCategoria;