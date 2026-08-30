import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

/*
==================================================
إعدادات المشروع
==================================================
*/

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const PROMO_CODE = "B7CD-808";


/*
==================================================
App
==================================================
*/

export default function App() {

  /*
  -----------------------------
  حالة تسجيل الدخول
  -----------------------------
  */

  const [mode, setMode] =
    useState("login");

  const [token, setToken] =
    useState(
      localStorage.getItem(
        "dz_token"
      ) || ""
    );

  const [user, setUser] =
    useState(() => {

      try {

        return JSON.parse(
          localStorage.getItem(
            "dz_user"
          )
        );

      } catch {

        return null;

      }

    });


  /*
  -----------------------------
  بيانات التسجيل
  -----------------------------
  */

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");


  /*
  -----------------------------
  المحفظة
  -----------------------------
  */

  const [account, setAccount] =
    useState("");

  const [balance, setBalance] =
    useState("0");

  const [network, setNetwork] =
    useState("");


  /*
  -----------------------------
  الطلب والمكافأة
  -----------------------------
  */

  const [order, setOrder] =
    useState(null);

  const [claim, setClaim] =
    useState(null);


  /*
  -----------------------------
  إرسال ETH
  -----------------------------
  */

  const [recipient, setRecipient] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [transactionHash, setTransactionHash] =
    useState("");


  /*
  -----------------------------
  حالات الواجهة
  -----------------------------
  */

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  /*
==================================================
حفظ جلسة المستخدم
==================================================
*/

  function saveSession(
    receivedToken,
    receivedUser
  ) {

    localStorage.setItem(
      "dz_token",
      receivedToken
    );

    localStorage.setItem(
      "dz_user",
      JSON.stringify(
        receivedUser
      )
    );

    setToken(
      receivedToken
    );

    setUser(
      receivedUser
    );

  }


  /*
==================================================
تسجيل حساب جديد
==================================================
*/

  async function register() {

    try {

      setLoading(true);
      setError("");
      setMessage("");

      if (
        !name.trim()
      ) {

        throw new Error(
          "أدخل الاسم."
        );

      }

      if (
        !email.trim()
      ) {

        throw new Error(
          "أدخل البريد الإلكتروني."
        );

      }

      if (
        password.length < 8
      ) {

        throw new Error(
          "كلمة المرور يجب أن تكون 8 أحرف على الأقل."
        );

      }

      if (
        password !==
        confirmPassword
      ) {

        throw new Error(
          "كلمتا المرور غير متطابقتين."
        );

      }


      const response =
        await fetch(
          `${API_URL}/api/auth/register`,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                name:
                  name.trim(),

                email:
                  email.trim()
                    .toLowerCase(),

                password

              })

          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ||
          "فشل إنشاء الحساب."
        );

      }


      saveSession(
        data.token,
        data.user
      );


      setMessage(
        "تم إنشاء الحساب وتسجيل الدخول بنجاح."
      );


      setPassword("");
      setConfirmPassword("");


    } catch (err) {

      setError(
        err.message ||
        "حدث خطأ."
      );

    } finally {

      setLoading(false);

    }

  }


  /*
==================================================
تسجيل الدخول
==================================================
*/

  async function login() {

    try {

      setLoading(true);
      setError("");
      setMessage("");

      if (
        !email.trim()
      ) {

        throw new Error(
          "أدخل البريد الإلكتروني."
        );

      }

      if (
        !password
      ) {

        throw new Error(
          "أدخل كلمة المرور."
        );

      }


      const response =
        await fetch(
          `${API_URL}/api/auth/login`,
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                email:
                  email.trim()
                    .toLowerCase(),

                password

              })

          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ||
          "بيانات تسجيل الدخول غير صحيحة."
        );

      }


      saveSession(
        data.token,
        data.user
      );


      setMessage(
        "تم تسجيل الدخول بنجاح."
      );


      setPassword("");


    } catch (err) {

      setError(
        err.message ||
        "حدث خطأ."
      );

    } finally {

      setLoading(false);

    }

  }


  /*
==================================================
تسجيل الخروج
==================================================
*/

  function logout() {

    localStorage.removeItem(
      "dz_token"
    );

    localStorage.removeItem(
      "dz_user"
    );

    setToken("");
    setUser(null);

    setAccount("");
    setBalance("0");
    setNetwork("");

    setOrder(null);
    setClaim(null);

    setMessage(
      "تم تسجيل الخروج."
    );

  }


  /*
==================================================
الاتصال بالمحفظة
==================================================
*/

  async function connectWallet() {

    try {

      setError("");
      setMessage("");

      if (
        !window.ethereum
      ) {

        throw new Error(
          "لم يتم العثور على محفظة Web3 مثل MetaMask."
        );

      }


      const provider =
        new ethers.BrowserProvider(
          window.ethereum
        );


      const accounts =
        await provider.send(
          "eth_requestAccounts",
          []
        );


      if (
        !accounts.length
      ) {

        throw new Error(
          "لم يتم اختيار محفظة."
        );

      }


      const address =
        accounts[0];


      setAccount(
        address
      );


      await loadWallet(
        provider,
        address
      );


      await loadReward(
        address
      );


      setMessage(
        "تم ربط المحفظة بنجاح."
      );


    } catch (err) {

      setError(
        err?.shortMessage ||
        err?.message ||
        "فشل ربط المحفظة."
      );

    }

  }


  /*
==================================================
قراءة رصيد المحفظة
==================================================
*/

  async function loadWallet(
    provider,
    address
  ) {

    try {

      const networkInfo =
        await provider.getNetwork();


      setNetwork(
        `${networkInfo.name} - Chain ID ${networkInfo.chainId.toString()}`
      );


      const rawBalance =
        await provider.getBalance(
          address
        );


      const eth =
        ethers.formatEther(
          rawBalance
        );


      setBalance(
        Number(eth).toFixed(6)
      );


    } catch (err) {

      console.error(err);

      setError(
        "تعذر قراءة رصيد المحفظة."
      );

    }

  }


  /*
==================================================
تحميل الطلب والمكافأة
==================================================
*/

  async function loadReward(
    address
  ) {

    try {

      const response =
        await fetch(
          `${API_URL}/api/rewards/${PROMO_CODE}/${address}`
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ||
          "تعذر تحميل الطلب."
        );

      }


      setOrder(
        data.order
      );

      setClaim(
        data.claim
      );


    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "تعذر الاتصال بالخادم."
      );

    }

  }


  /*
==================================================
استلام المكافأة
==================================================
*/

  async function claimReward() {

    try {

      setLoading(true);
      setError("");
      setMessage("");

      if (!token) {

        throw new Error(
          "يجب تسجيل الدخول أولاً."
        );

      }

      if (!account) {

        throw new Error(
          "قم بربط المحفظة أولاً."
        );

      }


      const response =
        await fetch(
          `${API_URL}/api/rewards/claim`,
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`

            },

            body:
              JSON.stringify({

                walletAddress:
                  account,

                promoCode:
                  PROMO_CODE

              })

          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ||
          "تعذر تسجيل المكافأة."
        );

      }


      setOrder(
        data.order
      );

      setClaim(
        data.claim
      );


      setMessage(
        "تم ربط المكافأة بالطلب B7CD-808."
      );


    } catch (err) {

      setError(
        err.message ||
        "حدث خطأ."
      );

    } finally {

      setLoading(false);

    }

  }


  /*
==================================================
إرسال ETH
==================================================
*/

  async function sendETH() {

    try {

      setLoading(true);
      setError("");
      setMessage("");
      setTransactionHash("");


      if (
        !account
      ) {

        throw new Error(
          "قم بربط المحفظة أولاً."
        );

      }


      if (
        !ethers.isAddress(
          recipient
        )
      ) {

        throw new Error(
          "عنوان Ethereum غير صحيح."
        );

      }


      if (
        !amount ||
        Number(amount) <= 0
      ) {

        throw new Error(
          "أدخل مبلغ ETH صحيح."
        );

      }


      const provider =
        new ethers.BrowserProvider(
          window.ethereum
        );


      const signer =
        await provider.getSigner();


      const transaction =
        await signer.sendTransaction({

          to:
            recipient,

          value:
            ethers.parseEther(
              amount
            )

        });


      setTransactionHash(
        transaction.hash
      );


      setMessage(
        "تم إرسال المعاملة، جاري انتظار التأكيد..."
      );


      await transaction.wait();


      setMessage(
        "تم تأكيد المعاملة على الشبكة."
      );


      await loadWallet(
        provider,
        account
      );


      setAmount("");


    } catch (err) {

      if (
        err?.code === 4001
      ) {

        setError(
          "تم رفض المعاملة من المحفظة."
        );

      } else {

        setError(
          err?.shortMessage ||
          err?.message ||
          "فشل إرسال ETH."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  /*
==================================================
تغيير الحساب
==================================================
*/

  useEffect(() => {

    if (
      !window.ethereum
    ) {

      return;

    }


    const accountsChanged =
      async (
        accounts
      ) => {

        if (
          !accounts.length
        ) {

          setAccount("");
          setBalance("0");
          setNetwork("");

          return;

        }


        const address =
          accounts[0];


        setAccount(
          address
        );


        const provider =
          new ethers.BrowserProvider(
            window.ethereum
          );


        await loadWallet(
          provider,
          address
        );


        await loadReward(
          address
        );

      };


    window.ethereum.on(
      "accountsChanged",
      accountsChanged
    );


    return () => {

      window.ethereum.removeListener(
        "accountsChanged",
        accountsChanged
      );

    };

  }, []);


  /*
==================================================
شاشة تسجيل الدخول / التسجيل
==================================================
*/

  if (!token || !user) {

    return (

      <div style={styles.page}>

        <div
          style={
            styles.authBox
          }
        >

          <h1
            style={
              styles.title
            }
          >
            محفظة دقن زين
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            الحساب • المحفظة • الطلبات • المكافآت
          </p>


          <div
            style={
              styles.tabs
            }
          >

            <button
              style={
                mode === "login"
                  ? styles.activeTab
                  : styles.tab
              }
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              تسجيل الدخول
            </button>


            <button
              style={
                mode === "register"
                  ? styles.activeTab
                  : styles.tab
              }
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
            >
              إنشاء حساب
            </button>

          </div>


          {mode === "register" && (

            <input
              style={
                styles.input
              }
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="الاسم"
            />

          )}


          <input
            style={
              styles.input
            }
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            placeholder="البريد الإلكتروني"
            autoComplete="email"
          />


          <input
            style={
              styles.input
            }
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            placeholder="كلمة المرور"
            autoComplete={
              mode === "login"
                ? "current-password"
                : "new-password"
            }
          />


          {mode === "register" && (

            <input
              style={
                styles.input
              }
              type="password"
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="تأكيد كلمة المرور"
              autoComplete="new-password"
            />

          )}


          <button
            style={
              styles.primary
            }
            disabled={
              loading
            }
            onClick={
              mode === "login"
                ? login
                : register
            }
          >

            {loading
              ? "جاري التنفيذ..."
              : mode === "login"
              ? "🔐 تسجيل الدخول"
              : "✨ إنشاء الحساب"}

          </button>


          {message && (

            <div
              style={
                styles.success
              }
            >
              {message}
            </div>

          )}


          {error && (

            <div
              style={
                styles.error
              }
            >
              {error}
            </div>

          )}


          <div
            style={
              styles.warning
            }
          >
            🔒 لا تدخل Seed Phrase أو Private Key هنا.
          </div>

        </div>

      </div>

    );

  }


  /*
==================================================
لوحة المستخدم
==================================================
*/

  return (

    <div style={styles.page}>

      <div
        style={
          styles.container
        }
      >

        <header
          style={
            styles.header
          }
        >

          <div>

            <h1>
              محفظة دقن زين
            </h1>

            <small>
              مرحباً {user.name}
            </small>

          </div>


          <button
            style={
              styles.logout
            }
            onClick={
              logout
            }
          >
            خروج
          </button>

        </header>


        {/* الحساب */}

        <section
          style={
            styles.card
          }
        >

          <h2>
            👤 الحساب
          </h2>

          <p>
            <strong>
              الاسم:
            </strong>{" "}
            {user.name}
          </p>

          <p>
            <strong>
              البريد:
            </strong>{" "}
            {user.email}
          </p>

        </section>


        {/* المحفظة */}

        <section
          style={
            styles.card
          }
        >

          <h2>
            💰 المحفظة
          </h2>


          {!account ? (

            <button
              style={
                styles.primary
              }
              onClick={
                connectWallet
              }
            >
              🔐 ربط محفظة Web3
            </button>

          ) : (

            <>

              <p>
                <strong>
                  العنوان:
                </strong>
              </p>

              <code
                style={
                  styles.address
                }
              >
                {account}
              </code>


              <p>
                <strong>
                  الشبكة:
                </strong>{" "}
                {network}
              </p>


              <div
                style={
                  styles.balance
                }
              >
                {balance} ETH
              </div>

            </>

          )}

        </section>


        {/* الطلب */}

        <section
          style={
            styles.card
          }
        >

          <h2>
            🍖 الطلب المرتبط
          </h2>


          <div
            style={
              styles.code
            }
          >
            {PROMO_CODE}
          </div>


          {order ? (

            <>

              <p>
                <strong>
                  الطلب:
                </strong>{" "}
                {order.order_code ||
                  order.orderId}
              </p>

              <p>
                <strong>
                  الوجبة:
                </strong>{" "}
                {order.dish_name ||
                  order.dishName}
              </p>

              <p>
                <strong>
                  الحالة:
                </strong>{" "}
                {order.status}
              </p>

            </>

          ) : (

            <p>
              لم يتم تحميل الطلب.
            </p>

          )}

        </section>


        {/* المكافأة */}

        <section
          style={
            styles.reward
          }
        >

          <h2>
            🎁 المكافأة
          </h2>


          <p>
            <strong>
              الكود:
            </strong>{" "}
            {PROMO_CODE}
          </p>


          <p>
            <strong>
              النقاط:
            </strong>{" "}
            {order?.reward_points ||
              150}
          </p>


          <p>
            <strong>
              Cashback:
            </strong>{" "}
            {order?.cashback_eth ||
              "0.005"} ETH
          </p>


          {claim ? (

            <div
              style={
                styles.claim
              }
            >

              <h3>
                ✅ تم تسجيل المكافأة
              </h3>

              <p>
                <strong>
                  Claim ID:
                </strong>{" "}
                {claim.claim_id ||
                  claim.claimId}
              </p>

              <p>
                <strong>
                  الحالة:
                </strong>{" "}
                {claim.status}
              </p>

            </div>

          ) : (

            <button
              style={
                styles.rewardButton
              }
              disabled={
                loading ||
                !account
              }
              onClick={
                claimReward
              }
            >
              {!account
                ? "اربط المحفظة أولاً"
                : loading
                ? "جاري التسجيل..."
                : "🎁 استلام المكافأة"}
            </button>

          )}

        </section>


        {/* إرسال ETH */}

        {account && (

          <section
            style={
              styles.card
            }
          >

            <h2>
              📤 إرسال ETH
            </h2>


            <input
              style={
                styles.input
              }
              value={
                recipient
              }
              onChange={(e) =>
                setRecipient(
                  e.target.value
                )
              }
              placeholder="عنوان المستلم 0x..."
            />


            <input
              style={
                styles.input
              }
              type="number"
              step="0.000001"
              value={
                amount
              }
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              placeholder="المبلغ ETH"
            />


            <button
              style={
                styles.primary
              }
              disabled={
                loading
              }
              onClick={
                sendETH
              }
            >
              {loading
                ? "جاري الإرسال..."
                : "إرسال ETH"}
            </button>


            {transactionHash && (

              <div
                style={
                  styles.hash
                }
              >

                <strong>
                  Transaction Hash:
                </strong>

                <br />

                <code>
                  {transactionHash}
                </code>

              </div>

            )}

          </section>

        )}


        {message && (

          <div
            style={
              styles.success
            }
          >
            {message}
          </div>

        )}


        {error && (

          <div
            style={
              styles.error
            }
          >
            {error}
          </div>

        )}


        <div
          style={
            styles.warning
          }
        >
          ⚠️ لا تشارك Seed Phrase أو
          Private Key مع أي شخص.
          معاملات ETH يتم توقيعها من محفظة Web3.
        </div>

      </div>

    </div>

  );

}


/*
==================================================
CSS
==================================================
*/

const styles = {

  page: {
    minHeight: "100vh",
    background: "#0b1120",
    color: "#fff",
    padding: "20px",
    fontFamily:
      "Tahoma, Arial, sans-serif",
    direction: "rtl"
  },

  container: {
    maxWidth: "720px",
    margin: "0 auto"
  },

  authBox: {
    maxWidth: "430px",
    margin: "50px auto",
    background: "#111827",
    padding: "25px",
    borderRadius: "16px",
    border:
      "1px solid #263244"
  },

  title: {
    textAlign: "center",
    marginBottom: "5px"
  },

  subtitle: {
    textAlign: "center",
    color: "#9ca3af",
    marginBottom: "25px"
  },

  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px"
  },

  tab: {
    flex: 1,
    padding: "12px",
    background: "#374151",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  activeTab: {
    flex: 1,
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    marginBottom: "12px",
    background: "#030712",
    color: "#fff",
    border:
      "1px solid #374151",
    borderRadius: "8px",
    fontSize: "16px"
  },

  primary: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },

  logout: {
    padding: "10px 16px",
    background: "#7f1d1d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },

  card: {
    background: "#111827",
    border:
      "1px solid #263244",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "16px"
  },

  reward: {
    background: "#10251a",
    border:
      "1px solid #245c3a",
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "16px"
  },

  address: {
    display: "block",
    background: "#030712",
    padding: "12px",
    borderRadius: "8px",
    wordBreak: "break-all",
    direction: "ltr"
  },

  balance: {
    textAlign: "center",
    fontSize: "32px",
    fontWeight: "bold",
    margin: "20px 0"
  },

  code: {
    background: "#030712",
    padding: "14px",
    borderRadius: "8px",
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: "20px",
    fontWeight: "bold",
    letterSpacing: "2px",
    marginBottom: "15px"
  },

  rewardButton: {
    width: "100%",
    padding: "14px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  claim: {
    background: "#07130d",
    padding: "15px",
    borderRadius: "8px"
  },

  hash: {
    marginTop: "15px",
    background: "#030712",
    padding: "12px",
    borderRadius: "8px",
    wordBreak: "break-all",
    direction: "ltr"
  },

  success: {
    background: "#064e3b",
    padding: "14px",
    borderRadius: "8px",
    marginTop: "15px"
  },

  error: {
    background: "#7f1d1d",
    padding: "14px",
    borderRadius: "8px",
    marginTop: "15px"
  },

  warning: {
    background: "#3b2f0b",
    color: "#facc15",
    padding: "14px",
    borderRadius: "8px",
    marginTop: "20px",
    fontSize: "14px"
  }

};
