import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "El email no es válido";
      }
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        }/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Registro Exitoso!",
          text: "Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión con tus credenciales.",
          confirmButtonColor: "#4CAF50",
          confirmButtonText: "Ir a Iniciar Sesión",
          timer: 5000,
          timerProgressBar: true,
        });

        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error de Registro",
          text: result.message || "No se pudo crear la cuenta",
          confirmButtonColor: "#f44336",
        });
      }
    } catch (error) {
      console.error("Error en registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "No se pudo conectar con el servidor. Inténtalo más tarde.",
        confirmButtonColor: "#f44336",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="min-w-screen min-h-screen flex items-center justify-center px-5 py-5">
        <div
          className="bg-gray-100 text-gray-500 rounded-3xl shadow-xl w-full overflow-hidden"
          style={{ maxWidth: "1000px" }}
        >
          <div className="md:flex w-full">
            <div className="hidden md:block w-1/2 bg-indigo-500 py-10 px-10">
              <svg
                id="a87032b8-5b37-4b7e-a4d9-4dbfbe394641"
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="auto"
                viewBox="0 0 744.84799 747.07702"
              >
                <path
                  id="fa3b9e12-7275-481e-bee9-64fd9595a50d"
                  data-name="Path 1"
                  d="M299.205,705.80851l-6.56-25.872a335.96693,335.96693,0,0,0-35.643-12.788l-.828,12.024-3.358-13.247c-15.021-4.29394-25.24-6.183-25.24-6.183s13.8,52.489,42.754,92.617l33.734,5.926-26.207,3.779a135.92592,135.92592,0,0,0,11.719,12.422c42.115,39.092,89.024,57.028,104.773,40.06s-5.625-62.412-47.74-101.5c-13.056-12.119-29.457-21.844-45.875-29.5Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#f2f2f2"
                />
                <path
                  id="bde08021-c30f-4979-a9d8-cb90b72b5ca2"
                  data-name="Path 2"
                  d="M361.591,677.70647l7.758-25.538a335.93951,335.93951,0,0,0-23.9-29.371l-6.924,9.865,3.972-13.076c-10.641-11.436-18.412-18.335-18.412-18.335s-15.315,52.067-11.275,101.384l25.815,22.51-24.392-10.312a135.91879,135.91879,0,0,0,3.614,16.694c15.846,55.234,46.731,94.835,68.983,88.451s27.446-56.335,11.6-111.569c-4.912-17.123-13.926-33.926-24.023-48.965Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#f2f2f2"
                />
                <path
                  id="b3ac2088-de9b-4f7f-bc99-0ed9705c1a9d"
                  data-name="Path 22"
                  d="M747.327,253.4445h-4.092v-112.1a64.883,64.883,0,0,0-64.883-64.883H440.845a64.883,64.883,0,0,0-64.883,64.883v615a64.883,64.883,0,0,0,64.883,64.883H678.352a64.883,64.883,0,0,0,64.882-64.883v-423.105h4.092Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#e6e6e6"
                />
                <path
                  id="b2715b96-3117-487c-acc0-20904544b5b7"
                  data-name="Path 23"
                  d="M680.97,93.3355h-31a23.02,23.02,0,0,1-21.316,31.714H492.589a23.02,23.02,0,0,1-21.314-31.714H442.319a48.454,48.454,0,0,0-48.454,48.454v614.107a48.454,48.454,0,0,0,48.454,48.454H680.97a48.454,48.454,0,0,0,48.454-48.454h0V141.7885a48.454,48.454,0,0,0-48.454-48.453Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#fff"
                />
                <path
                  id="b06d66ec-6c84-45dd-8c27-1263a6253192"
                  data-name="Path 6"
                  d="M531.234,337.96451a24.437,24.437,0,0,1,12.23-21.174,24.45,24.45,0,1,0,0,42.345A24.43391,24.43391,0,0,1,531.234,337.96451Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#ccc"
                />
                <path
                  id="e73810fe-4cf4-40cc-8c7c-ca544ce30bd4"
                  data-name="Path 7"
                  d="M561.971,337.96451a24.43594,24.43594,0,0,1,12.23-21.174,24.45,24.45,0,1,0,0,42.345A24.43391,24.43391,0,0,1,561.971,337.96451Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#ccc"
                />
                <circle
                  id="a4813fcf-056e-4514-bb8b-e6506f49341f"
                  data-name="Ellipse 1"
                  cx="364.43401"
                  cy="261.50202"
                  r="24.45"
                  fill="#6c63ff"
                />
                <path
                  id="bbe451c3-febc-41ba-8083-4c8307a2e73e"
                  data-name="Path 8"
                  d="M632.872,414.3305h-142.5a5.123,5.123,0,0,1-5.117-5.117v-142.5a5.123,5.123,0,0,1,5.117-5.117h142.5a5.123,5.123,0,0,1,5.117,5.117v142.5A5.123,5.123,0,0,1,632.872,414.3305Zm-142.5-150.686a3.073,3.073,0,0,0-3.07,3.07v142.5a3.073,3.073,0,0,0,3.07,3.07h142.5a3.073,3.073,0,0,0,3.07-3.07v-142.5a3.073,3.073,0,0,0-3.07-3.07Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#ccc"
                />
                <rect
                  id="bb28937d-932f-4fdf-befe-f406e51091fe"
                  data-name="Rectangle 1"
                  x="218.56201"
                  y="447.10197"
                  width="218.552"
                  height="2.047"
                  fill="#ccc"
                />
                <circle
                  id="fcef55fc-4968-45b2-93bb-1a1080c85fc7"
                  data-name="Ellipse 2"
                  cx="225.46401"
                  cy="427.41999"
                  r="6.902"
                  fill="#6c63ff"
                />
                <rect
                  id="ff33d889-4c74-4b91-85ef-b4882cc8fe76"
                  data-name="Rectangle 2"
                  x="218.56201"
                  y="516.11803"
                  width="218.552"
                  height="2.047"
                  fill="#ccc"
                />
                <circle
                  id="e8fa0310-b872-4adf-aedd-0c6eda09f3b8"
                  data-name="Ellipse 3"
                  cx="225.46401"
                  cy="496.43702"
                  r="6.902"
                  fill="#6c63ff"
                />
                <path
                  d="M660.69043,671.17188H591.62207a4.50493,4.50493,0,0,1-4.5-4.5v-24.208a4.50492,4.50492,0,0,1,4.5-4.5h69.06836a4.50491,4.50491,0,0,1,4.5,4.5v24.208A4.50492,4.50492,0,0,1,660.69043,671.17188Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#6c63ff"
                />
                <circle
                  id="e12ee00d-aa4a-4413-a013-11d20b7f97f7"
                  data-name="Ellipse 7"
                  cx="247.97799"
                  cy="427.41999"
                  r="6.902"
                  fill="#6c63ff"
                />
                <circle
                  id="f58f497e-6949-45c8-be5f-eee2aa0f6586"
                  data-name="Ellipse 8"
                  cx="270.492"
                  cy="427.41999"
                  r="6.902"
                  fill="#6c63ff"
                />
                <circle
                  id="b4d4939a-c6e6-4f4d-ba6c-e8b05485017d"
                  data-name="Ellipse 9"
                  cx="247.97799"
                  cy="496.43702"
                  r="6.902"
                  fill="#6c63ff"
                />
                <circle
                  id="aff120b1-519b-4e96-ac87-836aa55663de"
                  data-name="Ellipse 10"
                  cx="270.492"
                  cy="496.43702"
                  r="6.902"
                  fill="#6c63ff"
                />
                <path
                  id="f1094013-1297-477a-ac57-08eac07c4bd5"
                  data-name="Path 88"
                  d="M969.642,823.53851H251.656c-1.537,0-2.782-.546-2.782-1.218s1.245-1.219,2.782-1.219H969.642c1.536,0,2.782.546,2.782,1.219S971.178,823.53851,969.642,823.53851Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#3f3d56"
                />
                <path
                  d="M792.25256,565.92292a10.09371,10.09371,0,0,1,1.41075.78731l44.8523-19.14319,1.60093-11.81526,17.92157-.10956-1.05873,27.0982-59.19987,15.65584a10.60791,10.60791,0,0,1-.44749,1.20835,10.2346,10.2346,0,1,1-5.07946-13.68169Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#ffb8b8"
                />
                <polygon
                  points="636.98 735.021 624.72 735.021 618.888 687.733 636.982 687.734 636.98 735.021"
                  fill="#ffb8b8"
                />
                <path
                  d="M615.96281,731.51778h23.64387a0,0,0,0,1,0,0v14.88687a0,0,0,0,1,0,0H601.076a0,0,0,0,1,0,0v0A14.88686,14.88686,0,0,1,615.96281,731.51778Z"
                  fill="#2f2e41"
                />
                <polygon
                  points="684.66 731.557 672.459 732.759 662.018 686.271 680.025 684.497 684.66 731.557"
                  fill="#ffb8b8"
                />
                <path
                  d="M891.68576,806.12757h23.64387a0,0,0,0,1,0,0v14.88687a0,0,0,0,1,0,0H876.7989a0,0,0,0,1,0,0v0A14.88686,14.88686,0,0,1,891.68576,806.12757Z"
                  transform="translate(-303.00873 15.2906) rotate(-5.62529)"
                  fill="#2f2e41"
                />
                <circle
                  cx="640.3925"
                  cy="384.57375"
                  r="24.56103"
                  fill="#ffb8b8"
                />
                <path
                  id="ae7af94f-88d7-4204-9f07-e3651de85c05"
                  data-name="Path 99"
                  d="M852.38089,495.2538c-4.28634,2.548-6.85116,7.23043-8.32276,11.9951a113.681,113.681,0,0,0-4.88444,27.15943l-1.55553,27.60021-19.25508,73.1699c16.68871,14.1207,26.31542,10.91153,48.78049-.63879s25.03222,3.85117,25.03222,3.85117l4.49236-62.25839,6.41837-68.03232a30.16418,30.16418,0,0,0-4.86143-4.67415,49.65848,49.65848,0,0,0-42.44229-8.99538Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#ffffff"
                />
                <path
                  d="M846.12661,580.70047a10.52561,10.52561,0,0,1,1.50061.70389l44.34832-22.1972.736-12.02551,18.2938-1.26127.98041,27.4126L852.7199,592.93235a10.4958,10.4958,0,1,1-6.59329-12.23188Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#ffb8b8"
                />
                <path
                  id="a6768b0e-63d0-4b31-8462-9b2e0b00f0fd"
                  data-name="Path 101"
                  d="M902.76552,508.41151c10.91151,3.85117,12.83354,45.57369,12.83354,45.57369-12.8367-7.06036-28.24139,4.49318-28.24139,4.49318s-3.20916-10.91154-7.06034-25.03223a24.52987,24.52987,0,0,1,5.13436-23.10625S891.854,504.558,902.76552,508.41151Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#ffffff"
                />
                <path
                  id="bfd7963f-0cf8-4885-9d3a-2c00bccda2e3"
                  data-name="Path 102"
                  d="M889.99122,467.53052c-3.06-2.44837-7.23517,2.00173-7.23517,2.00173l-2.4484-22.03349s-15.30095,1.8329-25.0935-.61161-11.32255,8.87513-11.32255,8.87513a78.57978,78.57978,0,0,1-.30582-13.77092c.61158-5.50838,8.56838-11.01675,22.6451-14.68932S887.6518,439.543,887.6518,439.543C897.44542,444.43877,893.05121,469.97891,889.99122,467.53052Z"
                  transform="translate(-227.576 -76.46149)"
                  fill="#2f2e41"
                />
              </svg>
            </div>
            <div className="w-full md:w-1/2 py-10 px-5 md:px-10">
              <div className="text-center mb-10">
                <h1 className="font-bold text-3xl text-gray-900">
                  REGISTRO CERTIKA
                </h1>
                <p>CERTICOMERCE</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex -mx-3">
                  <div className="w-full px-3 mb-5">
                    <label
                      htmlFor="name"
                      className="text-xs font-semibold px-1"
                    >
                      Nombre Completo
                    </label>
                    <div className="flex">
                      <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                        <i className="mdi mdi-account-outline text-gray-400 text-lg"></i>
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-indigo-500"
                        placeholder="Joe Arroyo"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex -mx-3">
                  <div className="w-full px-3 mb-5">
                    <label
                      htmlFor="email"
                      className="text-xs font-semibold px-1"
                    >
                      Correo Electrónico
                    </label>
                    <div className="flex">
                      <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                        <i className="mdi mdi-email-outline text-gray-400 text-lg"></i>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-indigo-500"
                        placeholder="johnsmith@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex -mx-3">
                  <div className="w-full px-3 mb-5">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold px-1"
                    >
                      Contraseña
                    </label>
                    <div className="flex">
                      <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                        <i className="mdi mdi-lock-outline text-gray-400 text-lg"></i>
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-indigo-500"
                        placeholder="************"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex -mx-3">
                  <div className="w-full px-3 mb-5">
                    <label
                      htmlFor="confirmPassword"
                      className="text-xs font-semibold px-1"
                    >
                      Confirmar Contraseña
                    </label>
                    <div className="flex">
                      <div className="w-10 z-10 pl-1 text-center pointer-events-none flex items-center justify-center">
                        <i className="mdi mdi-lock-outline text-gray-400 text-lg"></i>
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full -ml-10 pl-10 pr-3 py-2 rounded-lg border-2 border-gray-200 outline-none focus:border-indigo-500"
                        placeholder="************"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex -mx-3">
                  <div className="w-full px-3 mb-5">
                    <button
                      type="submit"
                      className="block w-full max-w-xs mx-auto bg-indigo-500 hover:bg-indigo-700 focus:bg-indigo-700 text-white rounded-lg px-3 py-3 font-semibold"
                      disabled={loading}
                    >
                      {loading ? "REGISTERING..." : "REGISTRAME"}
                    </button>
                  </div>
                </div>
              </form>
              <div className="text-center">
                <p className="mt-1 text-sm font-display font-semibold text-gray-700 text-center">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    to="/login"
                    className="text-indigo-500 hover:text-indigo-700 font-medium"
                  >
                    Inicia Sesión
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
