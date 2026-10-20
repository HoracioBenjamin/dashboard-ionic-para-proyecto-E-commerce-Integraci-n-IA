import React, { useEffect, useState, useCallback } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonButtons, IonBackButton, IonMenuButton,
  IonGrid, IonRow, IonCol, IonSpinner,
  IonRefresher, IonRefresherContent, IonList
} from '@ionic/react';
import {
  cashOutline, checkmarkCircleOutline, timeOutline,
  chevronDownOutline, mailOutline, callOutline, receiptOutline
} from 'ionicons/icons';
import { supabase } from '../supabaseClient';
import ThemeToggle from '../components/ThemeToggle';
import './GestionarVentas.css';

interface Pedido {
  id: string;
  created_at: string;
  nombre_cliente: string;
  email: string;
  telefono: string;
  total: number;
  estado: string;
  metodo_pago_id: number;
}

interface DetallePedido {
  pedido_id: string;
  producto_id: number;
  cantidad: number;
  talla: string;
  precio_unitario: number;
  nombre_producto: string;
}

type FiltroEstado = 'todos' | 'pendiente' | 'exitoso';

const GestionarVentas: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [metodosPago, setMetodosPago] = useState<Record<number, string>>({});
  const [detalles, setDetalles] = useState<Record<string, DetallePedido[]>>({});
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [loading, setLoading] = useState(true);

  const cargarVentas = useCallback(async () => {
    try {
      setLoading(true);

      // Pedidos ordenados del más reciente al más antiguo
      const { data: pedidosData, error: errPedidos } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      if (errPedidos) throw errPedidos;
      const listaPedidos = pedidosData || [];
      setPedidos(listaPedidos);

      // Catálogo de métodos de pago
      const { data: metodos } = await supabase.from('metodos_pago').select('id, nombre');
      const mapaMetodos: Record<number, string> = {};
      (metodos || []).forEach((m: any) => { mapaMetodos[m.id] = m.nombre; });
      setMetodosPago(mapaMetodos);

      // Detalles de todos los pedidos en una sola consulta
      if (listaPedidos.length > 0) {
        const pedidoIds = listaPedidos.map((p: Pedido) => p.id);
        const { data: detallesData, error: errDetalles } = await supabase
          .from('detalles_pedido')
          .select('*')
          .in('pedido_id', pedidoIds);
        if (errDetalles) throw errDetalles;

        const listaDetalles = detallesData || [];

        // Nombres de los productos involucrados
        const productoIds = [...new Set(listaDetalles.map((d: any) => d.producto_id))];
        const mapaProductos: Record<number, string> = {};
        if (productoIds.length > 0) {
          const { data: productos } = await supabase
            .from('productos')
            .select('id, nombre')
            .in('id', productoIds);
          (productos || []).forEach((p: any) => { mapaProductos[p.id] = p.nombre; });
        }

        // Agrupar detalles por pedido
        const agrupados: Record<string, DetallePedido[]> = {};
        listaDetalles.forEach((d: any) => {
          if (!agrupados[d.pedido_id]) agrupados[d.pedido_id] = [];
          agrupados[d.pedido_id].push({
            ...d,
            nombre_producto: mapaProductos[d.producto_id] || `Producto #${d.producto_id}`
          });
        });
        setDetalles(agrupados);
      } else {
        setDetalles({});
      }
    } catch (err: any) {
      console.error('Error al cargar ventas:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  const toggleDetalle = (id: string) => {
    setExpandidos(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id); else nuevo.add(id);
      return nuevo;
    });
  };

  const doRefresh = async (event: any) => {
    await cargarVentas();
    event.detail.complete();
  };

  // Filtro + resumen calculado con TODOS los pedidos
  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtro);

  const totalVentas = pedidos
    .filter(p => p.estado === 'exitoso')
    .reduce((sum, p) => sum + (p.total || 0), 0);
  const cantidadExitosos = pedidos.filter(p => p.estado === 'exitoso').length;
  const cantidadPendientes = pedidos.filter(p => p.estado === 'pendiente').length;

  const claseEstado = (estado: string) => {
    if (estado === 'exitoso') return 'estado-exitoso';
    if (estado === 'pendiente') return 'estado-pendiente';
    return 'estado-otro';
  };

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton menu="main-menu" /><IonBackButton defaultHref="/home" color="primary" /></IonButtons>
          <IonTitle style={{ fontWeight: 'bold' }}>VENTAS / PEDIDOS</IonTitle>
          <IonButtons slot="end"><ThemeToggle /></IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding gray-bg">
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}><IonRefresherContent /></IonRefresher>

        {loading ? (
          <div className="ion-text-center ion-padding" style={{ marginTop: '20%' }}>
            <IonSpinner name="crescent" color="primary" /><p>Cargando ventas...</p>
          </div>
        ) : (
          <>
            {/* ===== Resumen de ventas ===== */}
            <IonGrid className="stats-grid">
              <IonRow>
                <IonCol size="4" className="ion-no-padding">
                  <div className="stat-card revenue">
                    <IonIcon icon={cashOutline} className="stat-icon" />
                    <span className="stat-value">${totalVentas.toLocaleString('es-CL')}</span>
                    <span className="stat-label">Recaudado</span>
                  </div>
                </IonCol>
                <IonCol size="4" className="ion-no-padding">
                  <div className="stat-card confirmed">
                    <IonIcon icon={checkmarkCircleOutline} className="stat-icon" />
                    <span className="stat-value">{cantidadExitosos}</span>
                    <span className="stat-label">Exitosos</span>
                  </div>
                </IonCol>
                <IonCol size="4" className="ion-no-padding">
                  <div className="stat-card pending">
                    <IonIcon icon={timeOutline} className="stat-icon" />
                    <span className="stat-value">{cantidadPendientes}</span>
                    <span className="stat-label">Pendientes</span>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* ===== Filtros por estado ===== */}
            <div className="filter-row">
              <button className={`filter-chip ${filtro === 'todos' ? 'active' : ''}`} onClick={() => setFiltro('todos')}>Todos</button>
              <button className={`filter-chip ${filtro === 'exitoso' ? 'active' : ''}`} onClick={() => setFiltro('exitoso')}>Exitosos</button>
              <button className={`filter-chip ${filtro === 'pendiente' ? 'active' : ''}`} onClick={() => setFiltro('pendiente')}>Pendientes</button>
            </div>

            <IonList className="transparent-list">
              {pedidosFiltrados.length === 0 ? (
                <div className="empty-state">
                  <IonIcon icon={receiptOutline} />
                  <p>No hay pedidos en esta categoría</p>
                </div>
              ) : (
                pedidosFiltrados.map(pedido => (
                  <div key={pedido.id} className="stock-card">
                    {/* Encabezado: ID + fecha + estado */}
                    <div className="pedido-header">
                      <span className="pedido-id">#{pedido.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`estado-badge ${claseEstado(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                    </div>
                    <div className="pedido-header" style={{ paddingTop: 4 }}>
                      <span />
                      <span className="pedido-date">{formatearFecha(pedido.created_at)}</span>
                    </div>

                    {/* Cliente y total */}
                    <div className="pedido-body">
                      <div>
                        <h2 className="cliente-name">{pedido.nombre_cliente}</h2>
                        <p className="cliente-contact"><IonIcon icon={mailOutline} /> {pedido.email}</p>
                        <p className="cliente-contact"><IonIcon icon={callOutline} /> {pedido.telefono}</p>
                      </div>
                      <div className="pedido-total">
                        <span className="monto">${(pedido.total || 0).toLocaleString('es-CL')}</span>
                        <span className="metodo">{metodosPago[pedido.metodo_pago_id] || 'Pago'}</span>
                      </div>
                    </div>

                    {/* Toggle detalle */}
                    <button className="detalle-toggle" onClick={() => toggleDetalle(pedido.id)}>
                      {expandidos.has(pedido.id) ? 'Ocultar detalle' : 'Ver detalle'}
                      <IonIcon icon={chevronDownOutline} className={`detalle-arrow ${expandidos.has(pedido.id) ? 'open' : ''}`} />
                    </button>

                    {/* Detalle expandido */}
                    {expandidos.has(pedido.id) && (
                      <div className="detalle-container">
                        {(detalles[pedido.id] || []).length === 0 ? (
                          <p className="detalle-vacio">Este pedido no tiene productos registrados</p>
                        ) : (
                          <>
                            {(detalles[pedido.id] || []).map((d, i) => (
                              <div key={i} className="detalle-item">
                                <div>
                                  <span className="nombre">{d.nombre_producto}</span>
                                  <br />
                                  <span className="meta">Talla {d.talla || '—'} • Cantidad: {d.cantidad}</span>
                                </div>
                                <span className="subtotal">${(d.precio_unitario * d.cantidad).toLocaleString('es-CL')}</span>
                              </div>
                            ))}
                            <div className="detalle-total-row">
                              <span>Total</span>
                              <span>${(pedido.total || 0).toLocaleString('es-CL')}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default GestionarVentas;
