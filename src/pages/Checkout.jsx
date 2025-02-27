import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};
  const [idOper, setIdOper] = useState("");
  const [errorCode, setErrorCode] = useState(null);
  const scriptLoaded = useRef(false);
  useEffect(() => {
    if (scriptLoaded.current) return;

    const script = document.createElement("script");
    script.src = "https://sis-t.redsys.es:25443/sis/NC/sandbox/redsysV3.js";
    script.async = true;
    document.body.appendChild(script);
    scriptLoaded.current = true;

    script.onload = () => {
      console.log("✅ Redsys script loaded.");

      getInSiteForm(
        "card-form",
        "background-color: #0074D9; color: white; font-weight: bold;",
        "background-color: #F8F9FA;",
        "background-color: #E9ECEF; border-radius: 8px;",
        "font-family: Arial, sans-serif; color: #333;",
        "Pagar con Redsys",
        "999008881",
        "1",
        `pedido${Math.floor(Math.random() * 1000 + 1)}`,
        "ES",
        false
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function merchantValidationEjemplo() {
    const errorCodeInput = document.getElementById("errorCode");
    const errorCodeValue = errorCodeInput ? errorCodeInput.value : null;

    console.log("🔍 Checking errorCode:", errorCodeValue);

    if (errorCodeValue && errorCodeValue !== "0") { // Ensure it's actually an error
      console.error(`🚨 Payment failed with error code: ${errorCodeValue}`);
      alert("Payment failed. Please try again.");
      return false;
    }

    console.log("✅ Payment validation successful.");
    return true;
  }

  useEffect(() => {
    const handlePaymentMessage = (event) => {
      const trustedOrigins = [
        "http://localhost:3000",
        "https://sis-t.redsys.es:25443",
      ];

      if (!trustedOrigins.includes(event.origin)) {
        console.warn("❌ Mensaje recibido de un origen no válido:", event.origin);
        return;
      }

      console.log("📩 Mensaje de pago: ", event.data);

      const { token, errorCode } = event.data;

      if (token) {
        document.getElementById("token").value = token;
        setIdOper(token);
      }

      if (errorCode) {
        document.getElementById("errorCode").value = errorCode;
        setErrorCode(errorCode);
      }

      console.log("Stored token:", token);
      console.log("Stored errorCode:", errorCode);

      storeIdOper(event, "token", "errorCode", () => {
        const isValid = merchantValidationEjemplo();
        if (!isValid) {
          navigate("/payment-failed");
        } else {
          navigate("/payment-success");
        }
      });

      const tokenValue = document.getElementById("token")?.value || "";
      setIdOper(tokenValue);
    };

    window.addEventListener("message", handlePaymentMessage);
    return () => {
      window.removeEventListener("message", handlePaymentMessage);
    };
  }, [navigate]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-rgx-blue text-[42px] font-semibold mb-8 font-montserrat">
        Pago Seguro con Redsys
      </h1>

      <div
        id="card-form"
        className="bg-white p-6 shadow-md rounded-lg text-center"
      ></div>

      <form name="datos">
        <input type="hidden" id="token" value={idOper} />
        <input type="hidden" id="errorCode" />
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          onClick={() => alert(`ID Operación: ${idOper}`)}
        >
          Ver ID Operación
        </button>
      </form>
    </div>
  );
};

export default Checkout;
