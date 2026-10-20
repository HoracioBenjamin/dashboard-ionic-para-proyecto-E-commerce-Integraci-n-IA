import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonInput, IonButton, IonSelect, IonSelectOption,
  IonToggle, IonBackButton, IonButtons, IonMenuButton, useIonToast, useIonLoading, IonIcon, IonLabel,
  IonModal, IonSearchbar, IonList
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { cloudUploadOutline, imageOutline, saveOutline, addOutline, trashOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import ImagenCampo from '../components/ImagenCampo';
import ThemeToggle from '../components/ThemeToggle';
import { HexColorPicker } from "react-colorful";
import './SubirProducto.css';
import { useIonViewDidEnter } from '@ionic/react';

const SubirProducto: React.FC = () => {
  const location = useLocation<{ producto: any }>();
  const history = useHistory();

  // Estados del Producto
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [marcaId, setMarcaId] = useState<number | null>(null);
  const [precio, setPrecio] = useState<number>(0);
  const [precioOferta, setPrecioOferta] = useState<number>(0);
  const [enOferta, setEnOferta] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [generoId, setGeneroId] = useState<number | null>(null);
  const [colorId, setColorId] = useState<number | null>(null);
  const [colorHex, setColorHex] = useState<string>('#ffffff');
  const [filtroColor, setFiltroColor] = useState<string>('');
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  const [listaMarcas, setListaMarcas] = useState<any[]>([]);
  const [listaCategorias, setListaCategorias] = useState<any[]>([]);
  const [listaGeneros, setListaGeneros] = useState<any[]>([]);
  const [listaColores, setListaColores] = useState<any[]>([]);
  const [variantes, setVariantes] = useState<{ talla: string, cantidad: number }[]>([]);

  const [presentToast] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();

  const generarSlug = (texto: string) => {
    return texto
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // 1. Cargar marcas, categorías y colores al montar
  useEffect(() => {
    const cargarDatosBase = async () => {
      const { data: m } = await supabase.from('marcas').select('*').order('nombre');
      const { data: c } = await supabase.from('categorias').select('*').order('nombre');
      const { data: col } = await supabase.from('colores').select('*').order('nombre');
      const { data: g } = await supabase.from('generos').select('*').order('id');
      setListaMarcas(m || []);
      setListaCategorias(c || []);
      setListaColores(col || []);
      setListaGeneros(g || []);
    };
    cargarDatosBase();
  }, []);

  // Efecto para actualizar el colorHex visualizado cuando se selecciona un colorId
  useEffect(() => {
    if (colorId && listaColores.length > 0) {
      const selectedColor = listaColores.find(c => c.id === colorId);
      if (selectedColor) {
        setColorHex(selectedColor.hex || selectedColor.codigo_hex || selectedColor.valor || '#ffffff');
      }
    } else {
      setColorHex('#ffffff');
    }
  }, [colorId, listaColores]);

  // 2. Sincronizar edición: Este useEffect se dispara cuando cambia la ruta o el estado enviado
  useEffect(() => {
    if (location.state?.producto) {
      const p = location.state.producto;
      setEditandoId(p.id);
      setNombre(p.nombre || '');
      setPrecio(p.precio || 0);
      setPrecioOferta(p.precio_oferta || 0);
      setEnOferta(p.en_oferta || false);
      setDescripcion(p.descripcion || '');
      setImagenUrl(p.imagen_url || '');
      setMarcaId(p.marca_id);
      setCategoriaId(p.categoria_id);
      setColorId(p.color_id || null);
      setGeneroId(p.genero_id || null);

      // Cargar tallas específicamente para este producto
      const cargarTallas = async () => {
        const { data } = await supabase
          .from('stock')
          .select('talla, cantidad')
          .eq('producto_id', p.id);
        if (data) setVariantes(data);
      };
      cargarTallas();
    } else {
      // Si no hay estado, resetear formulario para "Nuevo Producto"
      limpiarFormulario();
    }
  }, [location.state]); // Escucha cambios en la navegación

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre('');
    setPrecio(0);
    setPrecioOferta(0);
    setEnOferta(false);
    setDescripcion('');
    setImagenUrl('');
    setMarcaId(null);
    setCategoriaId(null);
    setColorId(null);
    setGeneroId(null);
    setColorHex('#ffffff');
    setVariantes([]);
  };

  const agregarVariante = () => setVariantes([...variantes, { talla: '', cantidad: 0 }]);

  const eliminarVariante = (index: number) => setVariantes(variantes.filter((_, i) => i !== index));

  const actualizarVariante = (index: number, campo: 'talla' | 'cantidad', valor: string) => {
    const nuevas = [...variantes];
    if (campo === 'talla') nuevas[index].talla = valor.toUpperCase();
    else nuevas[index].cantidad = Math.max(0, parseInt(valor) || 0);
    setVariantes(nuevas);
  };

  const handleGuardar = async () => {
    if (!nombre || precio <= 0 || !marcaId || !categoriaId) {
      presentToast({ message: 'Completa los campos obligatorios', duration: 2000, color: 'warning' });
      return;
    }

    await presentLoading('Cargando datos...');

    try {
      const datosProducto = {
        nombre, marca_id: marcaId, categoria_id: categoriaId, color_id: colorId, genero_id: generoId,
        precio, precio_oferta: enOferta ? precioOferta : null,
        en_oferta: enOferta, descripcion, imagen_url: imagenUrl
      };

      let productoId = editandoId;

      if (editandoId) {
        await supabase.from('productos').update(datosProducto).eq('id', editandoId);
      } else {
        const { data: nuevoP, error: errorP } = await supabase.from('productos').insert([datosProducto]).select().single();
        if (errorP) throw errorP;
        productoId = nuevoP.id;
      }

      // Gestión de Stock: Limpiar e Insertar (Arquitectura más limpia)
      await supabase.from('stock').delete().eq('producto_id', productoId);

      if (variantes.length > 0) {
        const datosStock = variantes
          .filter(v => v.talla.trim() !== '')
          .map(v => ({ producto_id: productoId, talla: v.talla, cantidad: v.cantidad }));

        const { error: errorS } = await supabase.from('stock').insert(datosStock);
        if (errorS) throw errorS;
      }

      await dismissLoading();
      presentToast({ message: 'Producto guardado con éxito', duration: 2000, color: 'success' });
      history.replace('/gestionar-stock');

    } catch (err: any) {
      await dismissLoading();
      presentToast({ message: 'Error: ' + err.message, duration: 4000, color: 'danger' });
    }
  };
  useIonViewDidEnter(() => {
    // Forzamos que el foco se mueva al contenedor principal de la nueva página
    const content = document.querySelector('ion-content');
    if (content) {
      content.focus();
    }
  });
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton menu="main-menu" /><IonBackButton defaultHref="/gestionar-stock" color="blue" /></IonButtons>
          <IonTitle style={{ fontWeight: 'bold' }}>{editandoId ? 'EDITAR' : 'NUEVO'} PRODUCTO</IonTitle>
          <IonButtons slot="end"><ThemeToggle /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding gray-bg">
        <div className="form-wrapper">
          <ImagenCampo
            label="URL Imagen"
            value={imagenUrl}
            onChange={setImagenUrl}
            carpeta="Producto_Imagenes"
            slugBase={generarSlug(nombre)}
            previewFit="cover"
            tituloPreview="Vista previa del producto"
          />

          <IonItem lines="none" className="custom-item">
            <IonInput label="Nombre Producto" labelPlacement="floating" fill="outline" value={nombre} onIonInput={e => setNombre(e.detail.value!)} />
          </IonItem>

          <div style={{ display: 'flex', gap: '10px', padding: '0 5px' }}>
            <IonSelect label="Marca" labelPlacement="floating" fill="outline" value={marcaId} onIonChange={e => setMarcaId(e.detail.value)} style={{ flex: 1 }}>
              {listaMarcas?.map(m => <IonSelectOption key={m.id} value={m.id}>{m.nombre}</IonSelectOption>)}
            </IonSelect>
            <IonSelect label="Categoría" labelPlacement="floating" fill="outline" value={categoriaId} onIonChange={e => setCategoriaId(e.detail.value)} style={{ flex: 1 }}>
              {listaCategorias?.map(c => <IonSelectOption key={c.id} value={c.id}>{c.nombre}</IonSelectOption>)}
            </IonSelect>
          </div>

          <div style={{ display: 'flex', gap: '10px', padding: '0 5px', marginTop: '15px' }}>
            <IonSelect
              label="Género"
              labelPlacement="floating"
              fill="outline"
              value={generoId}
              onIonChange={e => setGeneroId(e.detail.value)}
              style={{ flex: 1 }}
            >
              <IonSelectOption value={null}>Sin especificar</IonSelectOption>
              {listaGeneros?.map(g => <IonSelectOption key={g.id} value={g.id}>{g.nombre}</IonSelectOption>)}
            </IonSelect>
          </div>

          <div style={{ display: 'flex', gap: '10px', padding: '0 5px', marginTop: '15px', alignItems: 'center' }}>
            <IonItem 
              button 
              onClick={() => setIsColorModalOpen(true)} 
              lines="none" 
              className="custom-item" 
              style={{ flex: 1, border: '1px solid #ccc', borderRadius: '5px', '--padding-start': '10px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>Color</span>
                <span>{colorId ? listaColores.find(c => c.id === colorId)?.nombre : "Selecciona un Color"}</span>
              </div>
            </IonItem>
            
            {colorId && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                <HexColorPicker color={colorHex} style={{ width: '80px', height: '80px' }} />
              </div>
            )}
          </div>

          <IonModal isOpen={isColorModalOpen} onDidDismiss={() => setIsColorModalOpen(false)}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Selecciona un Color</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setIsColorModalOpen(false)}>Cerrar</IonButton>
                </IonButtons>
              </IonToolbar>
              <IonToolbar>
                <IonSearchbar 
                  placeholder="Buscar color..." 
                  value={filtroColor} 
                  onIonInput={(e) => setFiltroColor(e.detail.value!)} 
                />
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonList>
                <IonItem button onClick={() => { setColorId(null); setIsColorModalOpen(false); }}>
                  <IonLabel>Ninguno</IonLabel>
                </IonItem>
                {listaColores
                  ?.filter(c => c.nombre.toLowerCase().includes(filtroColor.toLowerCase()))
                  .map(c => (
                    <IonItem 
                      key={c.id} 
                      button 
                      onClick={() => { setColorId(c.id); setIsColorModalOpen(false); }}
                    >
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: c.hex || c.codigo_hex || c.valor || '#ccc', 
                        marginRight: '15px', 
                        borderRadius: '50%',
                        border: '1px solid #ddd'
                      }}></div>
                      <IonLabel>{c.nombre}</IonLabel>
                    </IonItem>
                ))}
              </IonList>
            </IonContent>
          </IonModal>

          <div className="tallas-seccion" style={{ marginTop: '20px', padding: '10px', background: '#fff', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <IonLabel style={{ fontWeight: 'bold' }}>Inventario de Tallas</IonLabel>
              <IonButton fill="outline" size="small" onClick={agregarVariante}>
                <IonIcon icon={addOutline} slot="start" /> Añadir
              </IonButton>
            </div>

            {variantes.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <IonInput placeholder="Talla" fill="outline" value={v.talla} onIonInput={e => actualizarVariante(i, 'talla', e.detail.value!)} style={{ flex: 2 }} />
                <IonInput type="number" placeholder="Stock" fill="outline" value={v.cantidad || ''} onIonInput={e => actualizarVariante(i, 'cantidad', e.detail.value!)} style={{ flex: 1 }} />
                <IonButton fill="clear" color="danger" onClick={() => eliminarVariante(i)}>
                  <IonIcon icon={trashOutline} slot="icon-only" />
                </IonButton>
              </div>
            ))}
          </div>

          <IonItem lines="none" className="custom-item" style={{ marginTop: '15px' }}>
            <IonInput label="Precio Normal ($)" labelPlacement="floating" fill="outline" type="number" value={precio} onIonInput={e => setPrecio(parseInt(e.detail.value!) || 0)} />
          </IonItem>

          <IonItem lines="none">
            <IonLabel>Activar Oferta</IonLabel>
            <IonToggle checked={enOferta} onIonChange={e => setEnOferta(e.detail.checked)} color="success" />
          </IonItem>

          {enOferta && (
            <IonItem lines="none" className="custom-item">
              <IonInput label="Precio Oferta ($)" labelPlacement="floating" fill="outline" type="number" value={precioOferta} onIonInput={e => setPrecioOferta(parseInt(e.detail.value!) || 0)} />
            </IonItem>
          )}

          <IonButton expand="block" mode="ios" onClick={handleGuardar} style={{ marginTop: '25px', height: '50px', fontWeight: 'bold' }}>
            <IonIcon icon={editandoId ? saveOutline : cloudUploadOutline} slot="start" />
            {editandoId ? 'GUARDAR CAMBIOS' : 'PUBLICAR PRODUCTO'}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SubirProducto;