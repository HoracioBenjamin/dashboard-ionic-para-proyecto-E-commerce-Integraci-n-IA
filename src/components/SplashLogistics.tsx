import React from 'react';
import { motion } from 'framer-motion';

/**
 * Escena logística 2D flat: cinta transportadora que alimenta
 * un camión de reparto. Todo vectorial (SVG + divs), sin imágenes.
 * Colores de marca: navy #002855, amarillo #FFB800.
 */

const BOX_COLORS = ['#FFB800', '#FFFFFF', '#FFB800'];

const Box: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    className="logistics-box"
    initial={{ x: -70 }}
    animate={{ x: 400 }}
    transition={{
      duration: 2.6,
      repeat: Infinity,
      ease: 'linear',
      delay: index * 0.85,
    }}
    style={{ backgroundColor: BOX_COLORS[index % BOX_COLORS.length] }}
    aria-hidden
  >
    {/* Cinta de embalaje vertical */}
    <span className="logistics-box-tape" />
    {/* Etiqueta / código de barras */}
    <span className="logistics-box-label">
      <span />
      <span />
      <span />
    </span>
  </motion.div>
);

const SplashLogistics: React.FC = () => (
  <div className="logistics-scene" aria-hidden>
    <svg className="logistics-bg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
      {/* Ruta punteada de despacho */}
      <line
        x1="8"
        y1="38"
        x2="392"
        y2="38"
        className="logistics-route"
        stroke="#3D5A80"
        strokeWidth="2"
        strokeDasharray="8 8"
        strokeLinecap="round"
      />
      {/* Pin de origen / destino */}
      <circle cx="20" cy="38" r="5" fill="#FFB800" />
      <circle cx="380" cy="38" r="5" fill="none" stroke="#FFB800" strokeWidth="2" />

      {/* Silueta almacén al fondo izquierda */}
      <g opacity="0.35">
        <rect x="18" y="66" width="64" height="40" rx="3" fill="#0A1930" stroke="#3D5A80" strokeWidth="1.5" />
        <polygon points="14,68 50,48 86,68" fill="#0A1930" stroke="#3D5A80" strokeWidth="1.5" />
        <rect x="42" y="86" width="16" height="20" fill="#16294d" />
      </g>

      {/* Camión de reparto (lateral derecho) */}
      <g>
        {/* Sombra */}
        <ellipse cx="315" cy="152" rx="62" ry="7" fill="rgba(0,0,0,0.35)" />
        {/* Furgón */}
        <rect x="258" y="72" width="98" height="64" rx="6" fill="#FFFFFF" />
        <rect x="258" y="72" width="98" height="20" rx="6" fill="#FFB800" />
        <rect x="258" y="86" width="98" height="6" fill="#FFB800" />
        {/* Logo mini en furgón */}
        <rect x="274" y="104" width="44" height="10" rx="2" fill="#002855" opacity="0.9" />
        <rect x="274" y="118" width="30" height="5" rx="2" fill="#3D5A80" opacity="0.7" />
        {/* Código barras lateral */}
        <g fill="#002855" opacity="0.75">
          <rect x="328" y="102" width="3" height="22" />
          <rect x="333" y="102" width="2" height="22" />
          <rect x="337" y="102" width="4" height="22" />
          <rect x="343" y="102" width="2" height="22" />
        </g>
        {/* Cabina */}
        <path d="M356 84 h22 l12 18 v34 h-34 z" fill="#E8EDF3" />
        <path d="M360 90 h13 l8 12 h-21 z" fill="#002855" opacity="0.85" />
        {/* Parachoques / luz */}
        <rect x="356" y="128" width="34" height="8" rx="2" fill="#0A1930" />
        <rect x="372" y="112" width="8" height="5" rx="1" fill="#FFB800" />
        {/* Ruedas (giran por CSS) */}
        <g className="logistics-wheel" style={{ transformOrigin: '286px 142px' }}>
          <circle cx="286" cy="142" r="12" fill="#0A1930" />
          <circle cx="286" cy="142" r="5" fill="#8DA2C0" />
          <line x1="286" y1="134" x2="286" y2="150" stroke="#8DA2C0" strokeWidth="2" />
          <line x1="278" y1="142" x2="294" y2="142" stroke="#8DA2C0" strokeWidth="2" />
        </g>
        <g className="logistics-wheel" style={{ transformOrigin: '344px 142px' }}>
          <circle cx="344" cy="142" r="12" fill="#0A1930" />
          <circle cx="344" cy="142" r="5" fill="#8DA2C0" />
          <line x1="344" y1="134" x2="344" y2="150" stroke="#8DA2C0" strokeWidth="2" />
          <line x1="336" y1="142" x2="352" y2="142" stroke="#8DA2C0" strokeWidth="2" />
        </g>
      </g>

      {/* Cinta transportadora */}
      <g>
        <rect x="10" y="152" width="250" height="14" rx="7" fill="#0A1930" stroke="#3D5A80" strokeWidth="1.5" />
        {/* Banda amarilla animada */}
        <rect x="16" y="156.5" width="238" height="5" rx="2.5" fill="none" stroke="#FFB800" strokeWidth="3" strokeDasharray="14 10" className="logistics-belt" />
        {/* Patas */}
        <line x1="40" y1="166" x2="32" y2="188" stroke="#3D5A80" strokeWidth="4" strokeLinecap="round" />
        <line x1="140" y1="166" x2="132" y2="188" stroke="#3D5A80" strokeWidth="4" strokeLinecap="round" />
        <line x1="230" y1="166" x2="222" y2="188" stroke="#3D5A80" strokeWidth="4" strokeLinecap="round" />
        {/* Rodillos */}
        <circle cx="24" cy="159" r="6" fill="#16294d" stroke="#8DA2C0" strokeWidth="1.5" />
        <circle cx="246" cy="159" r="6" fill="#16294d" stroke="#8DA2C0" strokeWidth="1.5" />
      </g>
    </svg>

    {/* Cajas en movimiento sobre la cinta */}
    <div className="logistics-boxes">
      <Box index={0} />
      <Box index={1} />
      <Box index={2} />
    </div>

    {/* Escáner sobre la cinta */}
    <div className="logistics-scanner" />
  </div>
);

export default SplashLogistics;
