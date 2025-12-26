import React, { useState } from "react";
import "./App.css";

function App() {
    const [amigos, setAmigos] = useState([]);
    const [nombre, setNombre] = useState("");

    // Gastos por amigo
    const [gastos, setGastos] = useState({});

    // Inputs por amigo (monto + descripcion)
    const [inputs, setInputs] = useState({});

    // Estado para mostrar las deudas
    const [deudas, setDeudas] = useState([]);

    const agregarAmigo = () => {
        if (nombre && !amigos.includes(nombre)) {
            setAmigos([...amigos, nombre]);

            setGastos({
                ...gastos,
                [nombre]: [],
            });

            setInputs({
                ...inputs,
                [nombre]: { monto: "", descripcion: "" },
            });

            setNombre("");
        }
    };

    const agregarGasto = (amigo) => {
        const { monto, descripcion } = inputs[amigo];

        if (monto && !isNaN(monto)) {
            setGastos({
                ...gastos,
                [amigo]: [
                    ...gastos[amigo],
                    {
                        monto: parseFloat(monto),
                        descripcion,
                    },
                ],
            });

            // limpiar inputs del amigo
            setInputs({
                ...inputs,
                [amigo]: { monto: "", descripcion: "" },
            });
        }
    };

    const totalPorAmigo = (amigo) =>
        gastos[amigo]?.reduce((acc, g) => acc + g.monto, 0) || 0;

    const totalGeneral = () =>
        amigos.reduce((acc, amigo) => acc + totalPorAmigo(amigo), 0);

    // Función para calcular deudas
    const calcularDeudas = () => {
        const total = totalGeneral();
        const n = amigos.length;
        if (n === 0) return;
        const promedio = total / n;
        // Calcula cuánto debe o le deben a cada uno
        const balances = amigos.map((amigo) => ({
            nombre: amigo,
            balance: totalPorAmigo(amigo) - promedio,
        }));
        // Separar deudores y acreedores
        let deudores = balances.filter((b) => b.balance < -0.01).map((b) => ({ ...b }));
        let acreedores = balances.filter((b) => b.balance > 0.01).map((b) => ({ ...b }));
        const movimientos = [];
        // Algoritmo para saldar deudas
        while (deudores.length && acreedores.length) {
            let deudor = deudores[0];
            let acreedor = acreedores[0];
            const monto = Math.min(-deudor.balance, acreedor.balance);
            movimientos.push({
                deudor: deudor.nombre,
                acreedor: acreedor.nombre,
                monto: monto,
            });
            deudor.balance += monto;
            acreedor.balance -= monto;
            if (Math.abs(deudor.balance) < 0.01) deudores.shift();
            if (Math.abs(acreedor.balance) < 0.01) acreedores.shift();
        }
        setDeudas(movimientos);
    };

    return (
        <div className="app">
            <h1>🍽️ Gastos de la comida</h1>

            {/* Amigos */}
            <div className="friends">
                {amigos.map((amigo) => (
                    <div key={amigo} className="card">
                        <h3>{amigo}</h3>

                        <ul>
                            {gastos[amigo].map((gasto, i) => (
                                <li key={i}>
                                    ${gasto.monto.toFixed(2)} — {gasto.descripcion}
                                </li>
                            ))}
                        </ul>

                        {/* Inputs independientes por amigo */}
                        <div className="add-expense">
                            <input
                                type="number"
                                placeholder="Monto"
                                value={inputs[amigo]?.monto || ""}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        [amigo]: {
                                            ...inputs[amigo],
                                            monto: e.target.value,
                                        },
                                    })
                                }
                            />

                            <input
                                type="text"
                                placeholder="Descripción"
                                value={inputs[amigo]?.descripcion || ""}
                                onChange={(e) =>
                                    setInputs({
                                        ...inputs,
                                        [amigo]: {
                                            ...inputs[amigo],
                                            descripcion: e.target.value,
                                        },
                                    })
                                }
                            />

                            <button onClick={() => agregarGasto(amigo)}>+</button>
                        </div>

                        <p className="total-amigo">
                            Total: ${totalPorAmigo(amigo).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>

            <h2 className="total-general">
                Total general: ${totalGeneral().toFixed(2)}
            </h2>

            {/* Agregar amigo */}
            <div className="add-friend">
                <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del amigo"
                />
                <button onClick={agregarAmigo}>Agregar amigo</button>
            </div>

            {/* Botón para calcular deudas */}
            <button className="calcular-deudas" onClick={calcularDeudas}>
                Calcular deudas
            </button>

            {/* Mostrar deudas */}
            {deudas.length > 0 && (
                <div className="deudas">
                    <h3>¿Quién le paga a quién?</h3>
                    <ul>
                        {deudas.map((d, i) => (
                            <li key={i}>
                                <strong>{d.deudor}</strong> le paga <strong>${d.monto.toFixed(2)}</strong> a <strong>{d.acreedor}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
