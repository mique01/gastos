import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "../styles.css";

const Dashboard = () => {
  const [expense, setExpense] = useState({ date: "", amount: "", category: "", paymentMethod: "", livesAlone: true, people: [] });
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [people, setPeople] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      const cats = await getDocs(collection(db, `users/${user.uid}/categories`));
      setCategories(cats.docs.map(doc => doc.data().name));
      const pms = await getDocs(collection(db, `users/${user.uid}/paymentMethods`));
      setPaymentMethods(pms.docs.map(doc => doc.data().name));
      const ppl = await getDocs(collection(db, `users/${user.uid}/people`));
      setPeople(ppl.docs.map(doc => doc.data().name));
      const exps = await getDocs(collection(db, `users/${user.uid}/expenses`));
      setExpenses(exps.docs.map(doc => doc.data()));
    };
    fetchData();
  }, [user]);

  const addExpense = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, `users/${user.uid}/expenses`), expense);
    setExpenses([...expenses, expense]);
    setExpense({ date: "", amount: "", category: "", paymentMethod: "", livesAlone: true, people: [] });
  };

  const addCategory = async (name) => {
    if (!name || categories.includes(name)) return;
    await addDoc(collection(db, `users/${user.uid}/categories`), { name });
    setCategories([...categories, name]);
  };

  const addPaymentMethod = async (name) => {
    if (!name || paymentMethods.includes(name)) return;
    await addDoc(collection(db, `users/${user.uid}/paymentMethods`), { name });
    setPaymentMethods([...paymentMethods, name]);
  };

  const addPerson = async (name) => {
    if (!name || people.includes(name)) return;
    await addDoc(collection(db, `users/${user.uid}/people`), { name });
    setPeople([...people, name]);
  };

  // Datos para gráficos
  const dataByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});
  const categoryChartData = Object.keys(dataByCategory).map(key => ({ name: key, value: dataByCategory[key] }));

  const dataByPerson = expenses.reduce((acc, exp) => {
    if (!exp.livesAlone && exp.people.length > 0) {
      exp.people.forEach(person => {
        acc[person] = (acc[person] || 0) + Number(exp.amount) / exp.people.length;
      });
    }
    return acc;
  }, {});
  const personChartData = Object.keys(dataByPerson).map(key => ({ name: key, value: dataByPerson[key] }));

  const dataByPayment = expenses.reduce((acc, exp) => {
    acc[exp.paymentMethod] = (acc[exp.paymentMethod] || 0) + Number(exp.amount);
    return acc;
  }, {});
  const paymentChartData = Object.keys(dataByPayment).map(key => ({ name: key, value: dataByPayment[key] }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384", "#36A2EB"];

  return (
    <div className="dashboard-container">
      <button onClick={() => signOut(auth)} className="signout-btn">Cerrar Sesión</button>
      <h1>Control de Gastos</h1>

      {/* Formulario de Gastos */}
      <form onSubmit={addExpense} className="expense-form">
        <input
          type="date"
          value={expense.date}
          onChange={(e) => setExpense({ ...expense, date: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Monto"
          value={expense.amount}
          onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
          required
        />
        <select
          value={expense.category}
          onChange={(e) => setExpense({ ...expense, category: e.target.value })}
          required
        >
          <option value="">Selecciona Categoría</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          value={expense.paymentMethod}
          onChange={(e) => setExpense({ ...expense, paymentMethod: e.target.value })}
          required
        >
          <option value="">Selecciona Método</option>
          {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
        </select>
        <label>
          ¿Vives solo?
          <select
            value={expense.livesAlone}
            onChange={(e) => setExpense({ ...expense, livesAlone: e.target.value === "true" })}
          >
            <option value={true}>Sí</option>
            <option value={false}>No</option>
          </select>
        </label>
        {!expense.livesAlone && (
          <select
            multiple
            value={expense.people}
            onChange={(e) => setExpense({ ...expense, people: Array.from(e.target.selectedOptions, option => option.value) })}
          >
            {people.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <button type="submit">Agregar Gasto</button>
      </form>

      {/* Gestión de Categorías, Métodos y Personas */}
      <div className="custom-inputs">
        <input
          placeholder="Nueva categoría"
          onKeyPress={(e) => e.key === "Enter" && addCategory(e.target.value) && (e.target.value = "")}
        />
        <input
          placeholder="Nuevo método de pago"
          onKeyPress={(e) => e.key === "Enter" && addPaymentMethod(e.target.value) && (e.target.value = "")}
        />
        <input
          placeholder="Nueva persona"
          onKeyPress={(e) => e.key === "Enter" && addPerson(e.target.value) && (e.target.value = "")}
        />
      </div>

      {/* Gráficos */}
      <div className="charts-container">
        <div>
          <h2>Gastos por Categoría</h2>
          <PieChart width={300} height={300}>
            <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {categoryChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <div>
          <h2>Gastos por Persona</h2>
          <PieChart width={300} height={300}>
            <Pie data={personChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {personChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <div>
          <h2>Gastos por Método de Pago</h2>
          <PieChart width={300} height={300}>
            <Pie data={paymentChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {paymentChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
