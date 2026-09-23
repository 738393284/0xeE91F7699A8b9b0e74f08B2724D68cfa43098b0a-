
import React, { useState } from "react";
import "./App.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const CODE = "B7CD-808";

export default function App() {
  const [page, setPage] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [user, setUser] = useState(
    localStorage.getItem("dz_user") || ""
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function register() {
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("اكتب الاسم.");
      return;
    }

    if (!email.trim()) {
      setError("اكتب البريد الإلكتروني.");
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل.");
      return;
    }

    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "فشل إنشاء الحساب."
        );
      }

      if (data.token) {
        localStorage.setItem(
          "dz_token",
          data.token
        );
      }

      const username =
        data.user?.name || name.trim();

      localStorage.setItem(
        "dz_user",
        username
      );

      setUser(username);
      setMessage("تم إنشاء الحساب بنجاح.");

    } catch (err) {
      setError(
        err.message ||
        "تعذر الاتصال بالخادم."
      );
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("اكتب البريد الإلكتروني.");
      return;
    }

    if (!password) {
      setError("اكتب كلمة المرور.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "البريد أو كلمة المرور غير صحيحة."
        );
      }

      if (data.token) {
        localStorage.setItem(
          "dz_token",
          data.token
        );
      }

      const username =
        data.user?.name ||
        email.trim();

      localStorage.setItem(
        "dz_user",
        username
      );

      setUser(username);
      setMessage("تم تسجيل الدخول بنجاح.");

    } catch (err) {
      setError(
        err.message ||
        "تعذر الاتصال بالخادم."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("dz_token");
    localStorage.removeItem("dz_user");

    setUser("");
    setEmail("");
    setPassword("");
    setMessage("تم تسجيل الخروج.");
  }

  if (user) {
    return (
      <div className="app">
        <div className="box">

          <h1>محفظة دقن زين</h1>

          <div className="welcome">
            مرحباً، {user}
          </div>

          <div className="card">

            <h2>🍖 الطلب</h2>

            <div className="code">
              {CODE}
            </div>

            <p>
              <b>الوجبة:</b>{" "}
              وجبة مندي لحم بلدي ممتاز
            </p>

            <p>
              <b>الحالة:</b>{" "}
              قيد التجهيز والتوصيل
            </p>

          </div>

          <div className="reward">

            <h2>🎁 المكافأة</h2>

            <p>
              <b>الكود:</b> {CODE}
            </p>

            <p>
              <b>نقاط الولاء:</b> 150 نقطة
            </p>

            <p>
              <b>الكاش باك:</b> 0.005 ETH
            </p>

            <button
              onClick={() =>
                setMessage(
                  `الكود ${CODE} مرتبط بهذا الطلب والمكافأة.`
                )
              }
            >
              استلام المكافأة
            </button>

          </div>

          {message && (
            <div className="success">
              {message}
            </div>
          )}

          <button
            className="logout"
            onClick={logout}
          >
            تسجيل الخروج
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="app">

      <div className="box">

        <h1>محفظة دقن زين</h1>

        <p className="subtitle">
          تسجيل الدخول وإدارة الطلب والمكافأة
        </p>

        <div className="tabs">

          <button
            className={
              page === "login"
                ? "active"
                : ""
            }
            onClick={() => {
              setPage("login");
              setError("");
              setMessage("");
            }}
          >
            تسجيل الدخول
          </button>

          <button
            className={
              page === "register"
                ? "active"
                : ""
            }
            onClick={() => {
              setPage("register");
              setError("");
              setMessage("");
            }}
          >
            إنشاء حساب
          </button>

        </div>

        {page === "register" && (
          <input
            type="text"
            placeholder="الاسم"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        )}

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {page === "register" && (
          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={confirm}
            onChange={(e) =>
  k       setConfirm(e.target.value)
          />
    )
        <button
          classnpm
          npmstart          
          ton"
          disabled={loading}
          onClick={
            page === "login"
              ? login
              : register
          }
        >
          {loading
            ? "جاري التنفيذ..."
            : page === "login"
            ? "🔐 تسجيل الدخول"
? "🔐 تسجيل الدخول"
تسجيل الدخول"
? "🔐 تسجيل الدخول"
الدخول"
تسجيل الول"

 🔐 جيل ول"
دخول"
الدخول"
تسجيل الدخول"
? "🔐 تسجيل الدخول"
   ✨ إنشاء الحساب"}








>



       {m (
 (
 
sge (

(
ge ssag 
 (
 (
(
 (
(
 (
(
 (
 (
 (
(
 (
(
ssage && (
 (
     <disName=ss">
     class"succ
ss">
>
       <div cl">
">
cess">
ss">

<div Name="success">
ss">
ss">
ss
="success">
ss">
 <div cl"suc">
>

uc">
uc">

uc">

>
">

uc">


 <divsName="success">
s">
>
">
">
">
ss">

     <div >
       e}
          </div>
 )}

       )}

)}

       )}

 {err 
       <div          {error}
 {error}
e="error">
{error}
{error}
e
r}
 {error}
e="error">
{error}
e="error">

             {error}
error}
r}
r}
 {error}
ror}
e="error">
            {error}
 {error}
         </div>
        )}

)}

   <div className="codeInfo">
">
nfo">
">
    b>كود والمكافأة</b>

   <div className="code">
          </div>
   </div>
     >


        <di="wag">
      🔒 لا rase أو
     te  في  سجيل الدخول.

  );
}
