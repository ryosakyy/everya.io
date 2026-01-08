import { useEffect, useState } from "react";
import "./nomina.css";

// --- FUNCIÓN AUXILIAR PARA FECHAS ---
// Garantiza que la Nómina y el Calendario entiendan las fechas igual
const normalizarFecha = (fechaSucia) => {
  if (!fechaSucia) return null;
  try {
    const fecha = new Date(fechaSucia);
    if (isNaN(fecha.getTime())) return null;
    return fecha;
  } catch (e) {
    return null;
  }
};

export default function Nomina() {
  const [datos, setDatos] = useState({
    mesTexto: "Cargando...",
    sueldoBase: 1200, // Sueldo por defecto
    diasTrabajados: 0,
    totalTardanzas: 0,
    descuento: 0,
    sueldoFinal: 0,
    valorMinuto: 0
  });

  const [modoPrueba, setModoPrueba] = useState(false);

  useEffect(() => {
    // 1. INTENTAR IDENTIFICAR AL USUARIO
    const usuarioGuardado = localStorage.getItem("usuario");
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    
    // Buscamos el DNI en varios campos posibles
    const miDNI = usuario ? String(usuario.dni_usuario || usuario.dni || usuario.id || "") : "";

    // Si no hay DNI, activamos el "Modo Prueba" para que veas datos
    if (miDNI === "") setModoPrueba(true);

    // 2. DEFINIR EL MES ACTUAL
    const hoy = new Date();
    const mesActual = hoy.getMonth();      // 0 = Enero
    const anioActual = hoy.getFullYear();
    
    // Formato bonito: "enero de 2026"
    const nombreMes = hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    console.log(`💰 Calculando nómina. Usuario: ${miDNI || "DESCONOCIDO (Modo Prueba)"}`);

    // 3. OBTENER DATOS DEL BACKEND
    fetch("http://localhost:5000/reportes")
      .then((res) => res.json())
      .then((data) => {
        
        // --- FILTRADO DE DATOS ---
        const asistenciasDelMes = data.filter((item) => {
          // A. LÓGICA DE USUARIO
          // Si tengo DNI, busco solo lo mío. Si no tengo DNI (modo prueba), acepto todo.
          const dniItem = String(item.dni_usuario || item.dni || "");
          const coincideUsuario = (miDNI === "") || (dniItem === miDNI);
          
          // B. LÓGICA DE FECHA
          const fechaItem = normalizarFecha(item.fecha);
          if (!fechaItem) return false; // Fecha inválida se descarta

          const esEsteMes = fechaItem.getMonth() === mesActual && 
                            fechaItem.getFullYear() === anioActual;

          return coincideUsuario && esEsteMes;
        });

        // --- CÁLCULOS MATEMÁTICOS ---
        
        // 1. Total Días
        const diasTrabajados = asistenciasDelMes.length;

        // 2. Total Minutos Tarde (Convirtiendo texto a número seguro)
        const totalMinutosTarde = asistenciasDelMes.reduce((suma, item) => {
          const minutos = Number(item.minutos_tarde); 
          return suma + (isNaN(minutos) ? 0 : minutos);
        }, 0);

        // 3. Sueldo Base
        const sueldoBase = usuario && usuario.sueldo_base ? Number(usuario.sueldo_base) : 1200;

        // 4. Valor del Minuto
        // Fórmula: Sueldo / 30 días / 6 horas / 60 minutos (180 horas al mes)
        const valorMinuto = sueldoBase / 180 / 60; 

        // 5. Descuento y Final
        const descuento = totalMinutosTarde * valorMinuto;
        const sueldoFinal = sueldoBase - descuento;

        // --- ACTUALIZAR PANTALLA ---
        setDatos({
          mesTexto: nombreMes,
          sueldoBase: sueldoBase,
          diasTrabajados: diasTrabajados,
          totalTardanzas: totalMinutosTarde,
          descuento: descuento,
          sueldoFinal: sueldoFinal,
          valorMinuto: valorMinuto
        });
      })
      .catch((err) => console.error("Error cargando nómina:", err));
  }, []);

  return (
    <section className="nomina-card">
      <div className="nomina-header">
        <h2 className="nomina-title">Resumen de Nómina</h2>
        <p className="nomina-subtitle" style={{textTransform: 'capitalize'}}>{datos.mesTexto}</p>
      </div>

      {/* AVISO DISCRETO SI ESTÁS EN MODO PRUEBA */}
      {modoPrueba && (
        <div style={{
            fontSize: '12px', 
            color: '#666', 
            textAlign: 'center', 
            marginBottom: '10px',
            background: '#f3f4f6',
            padding: '5px',
            borderRadius: '4px'
        }}>
           ℹ️ Vista Previa (Mostrando todos los registros porque no has iniciado sesión)
        </div>
      )}

      <div className="nomina-grid2">
        <div className="nomina-box nomina-box-purple">
          <div className="nomina-label">Sueldo Base</div>
          <div className="nomina-big">S/{datos.sueldoBase.toFixed(2)}</div>
        </div>

        <div className="nomina-box nomina-box-green">
          <div className="nomina-label">Días Trabajados</div>
          <div className="nomina-big">{datos.diasTrabajados}</div>
        </div>
      </div>

      <div className="nomina-box nomina-box-red">
        <div className="nomina-label">Total Tardanzas Acumuladas</div>
        <div className="nomina-big">{datos.totalTardanzas} minutos</div>
      </div>

      <div className="nomina-box nomina-box-orange">
        <div className="nomina-label">Descuento por Tardanza</div>
        <div className="nomina-big">-S/{datos.descuento.toFixed(2)}</div>
      </div>

      <div className="nomina-box nomina-box-final">
        <div className="nomina-label">Sueldo A Recibir</div>
        <div className="nomina-final">S/{datos.sueldoFinal.toFixed(2)}</div>
      </div>

      <div className="nomina-divider" />

      <div className="nomina-calc-title">Detalle del Cálculo</div>

      <div className="nomina-calc">
        <ul>
          <li><strong>Base de cálculo:</strong> 30 días × 6 horas = 180 horas/mes.</li>
          <li>
            Valor por minuto: <strong>S/{datos.valorMinuto.toFixed(4)}</strong>
          </li>
          <li>
            Operación: {datos.totalTardanzas} min × S/{datos.valorMinuto.toFixed(4)} = 
            <span style={{color: '#ef4444', fontWeight: 'bold'}}> -S/{datos.descuento.toFixed(2)}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}