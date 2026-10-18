import React, { useRef, useState } from 'react';
import {
  IonItem, IonInput, IonButton, IonIcon, IonLabel,
  IonSpinner, IonActionSheet, useIonToast,
} from '@ionic/react';
import { linkOutline, cloudUploadOutline, eyeOutline, cameraOutline, imageOutline, documentOutline, logoGoogle, phonePortraitOutline, chevronForwardOutline, closeOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import { PLACEHOLDER_IMG } from './placeholder';

const BUCKET = 'imagenes';
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const EXT_PERMITIDAS = ['jpg', 'jpeg', 'png', 'webp'];
const CARPETAS_CATALOGO = ['Logo_Categorias', 'Logo_Marcas', 'Portada_Categorias', 'Portada_Marcas'];

const convertirImagen = async (archivo: File, extension: string): Promise<Blob> => {
  const bitmap = await createImageBitmap(archivo);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const contexto = canvas.getContext('2d');
    if (!contexto) throw new Error('No se pudo procesar la imagen');
    const tipo = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : `image/${extension}`;
    if (tipo === 'image/jpeg') {
      contexto.fillStyle = '#fff';
      contexto.fillRect(0, 0, canvas.width, canvas.height);
    }
    contexto.drawImage(bitmap, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob || blob.type !== tipo) reject(new Error('No se pudo convertir la imagen'));
        else if (blob.size > MAX_BYTES) reject(new Error('La imagen procesada supera los 2 MB'));
        else resolve(blob);
      }, tipo, 0.9);
    });
  } finally {
    bitmap.close();
  }
};

interface Props {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Carpeta dentro del bucket (ej: 'Logo_Marcas') */
  carpeta: string;
  /** Slug base para nombrar el archivo (ej: 'louis-vuitton') */
  slugBase: string;
  /** Cómo mostrar la vista previa */
  previewFit?: 'contain' | 'cover';
  tituloPreview?: string;
}

/**
 * Campo de imagen dual: input de lado a lado con cuadradito a la derecha
 * para alternar entre pegar URL o subir archivo al bucket.
 * El archivo se guarda como <carpeta>/<slug>.<ext> con upsert (reemplaza).
 */
const ImagenCampo: React.FC<Props> = ({
  label, value, onChange, carpeta, slugBase, previewFit = 'contain', tituloPreview = 'Vista previa',
}) => {
  const [modo, setModo] = useState<'url' | 'archivo'>('url');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [previewLocal, setPreviewLocal] = useState<string>('');
  const [subiendo, setSubiendo] = useState(false);
  const [sheetAbierto, setSheetAbierto] = useState(false);
  const [acceptArchivo, setAcceptArchivo] = useState('image/*');
  const [captureArchivo, setCaptureArchivo] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const [presentToast] = useIonToast();

  const irAModo = (nuevo: 'url' | 'archivo') => {
    setSheetAbierto(false);
    if (nuevo === 'url') {
      // Al volver a URL se descarta cualquier archivo pendiente
      setArchivo(null);
      setPreviewLocal('');
      if (fileRef.current) fileRef.current.value = '';
    }
    setModo(nuevo);
  };

  const elegirOrigen = (origen: 'telefono' | 'camara' | 'archivos') => {
    if (origen === 'camara') {
      setAcceptArchivo('image/*');
      setCaptureArchivo('environment');
    } else if (origen === 'telefono') {
      // Teléfono → galería del dispositivo
      setAcceptArchivo('image/*');
      setCaptureArchivo(undefined);
    } else {
      setAcceptArchivo('image/*,.heic,.heif');
      setCaptureArchivo(undefined);
    }
    // Esperar un tick para que el input tome los nuevos atributos
    setTimeout(() => fileRef.current?.click(), 50);
  };

  const elegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      presentToast({ message: 'El archivo debe ser una imagen', duration: 2500, color: 'warning' });
      return;
    }
    if (f.size > MAX_BYTES) {
      presentToast({ message: 'La imagen supera los 2 MB', duration: 2500, color: 'warning' });
      return;
    }
    setArchivo(f);
    setPreviewLocal(URL.createObjectURL(f));
  };

  const subirArchivo = async () => {
    if (!archivo) {
      presentToast({ message: 'Selecciona una imagen primero', duration: 2000, color: 'warning' });
      return;
    }
    if (!slugBase.trim()) {
      presentToast({ message: 'Se necesita un slug para subir la imagen. Guarda el registro con su slug primero.', duration: 3000, color: 'warning' });
      return;
    }
    const ext = (archivo.name.split('.').pop() || '').toLowerCase();
    if (!EXT_PERMITIDAS.includes(ext)) {
      presentToast({ message: 'Extensión no permitida (jpg, png, webp)', duration: 2500, color: 'warning' });
      return;
    }
    setSubiendo(true);
    try {
      const slug = slugBase.trim();
      if (slug.includes('/') || slug.includes('\\') || slug === '.' || slug === '..') {
        throw new Error('El slug no es válido como nombre de archivo');
      }
      let extensionDestino = ext;
      let contenido: Blob = archivo;
      if (CARPETAS_CATALOGO.includes(carpeta)) {
        // Mantener la misma ruta aunque la nueva foto tenga otra extensión.
        const { data: base } = supabase.storage.from(BUCKET).getPublicUrl(`${carpeta}/${slug}`);
        const rutaActual = value.split(/[?#]/)[0];
        const extensionActual = EXT_PERMITIDAS.find(extension => rutaActual === `${base.publicUrl}.${extension}`);
        if (extensionActual) {
          extensionDestino = extensionActual;
        } else {
          // Consultar archivos es opcional: algunas políticas permiten subir pero no listar.
          const { data: existentes, error: listError } = await supabase.storage
            .from(BUCKET).list(carpeta, { search: `${slug}.`, limit: 100 });
          if (!listError) {
            const anterior = existentes?.find(item =>
              EXT_PERMITIDAS.some(extension => item.name === `${slug}.${extension}`));
            extensionDestino = anterior?.name.split('.').pop() || ext;
          }
        }
        if (extensionDestino !== ext) contenido = await convertirImagen(archivo, extensionDestino);
      }
      const ruta = `${carpeta}/${slug}.${extensionDestino}`;
      const { data: subida, error: upError } = await supabase.storage
        .from(BUCKET)
        .upload(ruta, contenido, { upsert: true, contentType: contenido.type, cacheControl: '0' });
      if (upError) throw upError;
      if (!subida?.path) throw new Error('Supabase no confirmó la ruta del archivo subido');
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
      onChange(CARPETAS_CATALOGO.includes(carpeta) ? `${data.publicUrl}?v=${Date.now()}` : data.publicUrl);
      setArchivo(null);
      setPreviewLocal('');
      if (fileRef.current) fileRef.current.value = '';
      presentToast({
        message: `Imagen subida a ${BUCKET}/${subida.path}. Guarda los cambios para asociarla al registro.`,
        duration: 10000,
        color: 'success',
        buttons: [{ text: 'Cerrar', role: 'cancel' }],
      });
    } catch (err: any) {
      const mensaje = err?.message || 'No se pudo conectar con Supabase';
      const detalle = /row.level security|permission|unauthorized/i.test(mensaje)
        ? `Supabase rechazó la subida por permisos del bucket ${BUCKET}: ${mensaje}`
        : `Error al subir a ${BUCKET}/${carpeta}: ${mensaje}`;
      presentToast({ message: detalle, duration: 10000, color: 'danger', buttons: [{ text: 'Cerrar', role: 'cancel' }] });
    } finally {
      setSubiendo(false);
    }
  };

  const limpiarArchivo = () => {
    setArchivo(null);
    setPreviewLocal('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <style>{`@media (max-width: 380px) { .imgcampo-toggle-btn { width: 40px !important; height: 40px !important; } }`}</style>
      {/* Fila única: input + toggle ON/OFF centrado a la derecha */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <IonItem lines="none" className="input-item" style={{ '--padding-end': 0, '--min-height': '56px' }}>
            {modo === 'url' ? (
              <IonInput
                label={label} labelPlacement="floating" fill="outline" mode="md"
                value={value} onIonInput={(e) => onChange(e.detail.value!)}
                placeholder="https://link-a-imagen.png"
              />
            ) : (
              /* Modo archivo: label + caja que abre la ventana de opciones */
              <div style={{ width: '100%', padding: '6px 0' }}>
                <IonLabel style={{ fontSize: '0.72rem', color: '#666', display: 'block', marginBottom: '6px' }}>
                  Elige una de las opciones
                </IonLabel>
                <IonItem
                  lines="none"
                  button
                  detail={false}
                  onClick={() => setSheetAbierto(true)}
                  style={{
                    '--min-height': '48px',
                    '--background': '#f9f9f9',
                    '--border-radius': '10px',
                    border: '1px dashed #ccc',
                    fontSize: '0.85rem',
                  }}
                >
                  <IonIcon icon={cloudUploadOutline} slot="start" style={{ fontSize: '1.2rem', color: '#002855' }} />
                  <IonLabel>{archivo ? archivo.name : 'Seleccionar origen…'}</IonLabel>
                  <IonIcon icon={chevronForwardOutline} slot="end" style={{ fontSize: '1rem', color: '#999' }} />
                </IonItem>
                {archivo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.78rem', color: '#002855' }}>
                    <IonIcon icon={imageOutline} style={{ fontSize: '1rem' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{archivo.name}</span>
                    <IonButton fill="clear" size="small" color="danger" onClick={limpiarArchivo} style={{ margin: 0 }}>
                      <IonIcon icon={closeOutline} slot="icon-only" style={{ fontSize: '1rem' }} />
                    </IonButton>
                  </div>
                )}
              </div>
            )}
          </IonItem>
        </div>

        {/* Toggle ON/OFF: 2 cuadrados pegados, centrados con la fila */}
        <div
          style={{
            display: 'flex',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #d7dce2',
            flexShrink: 0,
            alignSelf: 'center',
          }}
          role="group"
          aria-label="Origen de la imagen"
        >
          {(
            [
              { valor: 'url', icono: linkOutline, titulo: 'Pegar URL' },
              { valor: 'archivo', icono: cloudUploadOutline, titulo: 'Subir archivo' },
            ] as const
          ).map((op) => {
            const activo = modo === op.valor;
            return (
              <IonButton
                key={op.valor}
                fill="solid"
                onClick={() => irAModo(op.valor)}
                title={op.titulo}
                className="imgcampo-toggle-btn"
                style={{
                  width: '44px',
                  height: '44px',
                  margin: 0,
                  '--border-radius': '0',
                  '--background': activo ? '#002855' : '#E9ECEF',
                  '--color': activo ? '#ffffff' : '#8a8f98',
                }}
              >
                <IonIcon icon={op.icono} slot="icon-only" style={{ fontSize: '1.2rem' }} />
              </IonButton>
            );
          })}
        </div>
      </div>

      {/* Input de archivo oculto (se dispara desde el action sheet) */}
      <input
        ref={fileRef}
        type="file"
        accept={acceptArchivo}
        capture={captureArchivo as any}
        onChange={elegirArchivo}
        style={{ display: 'none' }}
      />

      {/* Ventana inferior: desde dónde cargar la imagen */}
      <IonActionSheet
        isOpen={sheetAbierto}
        onDidDismiss={() => setSheetAbierto(false)}
        header="¿Desde dónde cargar la imagen?"
        buttons={[
          { text: 'Google Drive (Próximamente)', icon: logoGoogle, role: 'cancel' },
          { text: 'Teléfono (Galería)', icon: phonePortraitOutline, handler: () => elegirOrigen('telefono') },
          { text: 'Cámara', icon: cameraOutline, handler: () => elegirOrigen('camara') },
          { text: 'Archivos', icon: documentOutline, handler: () => elegirOrigen('archivos') },
          { text: 'Cancelar', role: 'cancel' },
        ]}
      />

      {/* Botón de subida (modo archivo con archivo elegido) */}
      {modo === 'archivo' && archivo && (
        <IonButton expand="block" size="small" onClick={subirArchivo} disabled={subiendo} style={{ marginTop: '8px' }}>
          {subiendo ? <IonSpinner name="crescent" /> : <IonIcon icon={cloudUploadOutline} slot="start" />}
          {subiendo ? 'Subiendo...' : `Subir a ${carpeta}/ (máx 2 MB)`}
        </IonButton>
      )}
      {modo === 'archivo' && (
        <p style={{ fontSize: '0.7rem', color: '#888', margin: '6px 0 0', textAlign: 'center' }}>
          Se guardará como {carpeta}/{slugBase.trim() || '...'}.(jpg|png|webp)
        </p>
      )}

      {(previewLocal || value) && (
        <div className="url-preview ion-text-center ion-padding-vertical" style={{ background: '#f9f9f9', borderRadius: '10px', marginTop: '10px', border: '1px dashed #ccc' }}>
          <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '8px' }}>
            <IonIcon icon={eyeOutline} /> {tituloPreview}
          </p>
          <img
            src={previewLocal || value}
            alt={tituloPreview}
            style={{ maxHeight: '80px', maxWidth: '100%', width: previewFit === 'cover' ? '100%' : undefined, objectFit: previewFit, borderRadius: '6px' }}
            onError={(e: any) => { if (!previewLocal && !e.target.src.startsWith('data:')) e.target.src = PLACEHOLDER_IMG; }}
          />
        </div>
      )}
    </div>
  );
};

export default ImagenCampo;
