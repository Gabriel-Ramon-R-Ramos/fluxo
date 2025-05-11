document
  .getElementById("form_user")
  .addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;

    console.log("E-mail:", email);
    console.log("Senha: ", senha);

    if (!email || !senha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const resposta = await fetch(
        "https://api-fluxo.onrender.com/usuarios/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: senha,
          }),
        }
      );

      const contentType = resposta.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      let dados = {};
      let texto = "";

      if (isJson) {
        dados = await resposta.json();
        console.log(dados);
      } else {
        texto = await resposta.text();
        console.log(texto);
      }

      if (resposta.ok) {
        localStorage.setItem("token", dados.token);
        window.location.href = "PI - FLUXO/SCR/PAGINAS/Produtos.html";
      } else {
        alert(dados?.mensagem || "Login inválido!");
      }
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      alert("Erro na conexão com o servidor");
    }

    console.log(dados);
  });

const colors = ["#3498db", "#1abc9c", "#9b59b6"];
function createWave() {
  const wave = document.createElement("div");
  const size = Math.random() * 100 + 50; // entre 50px e 150px
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  const color = colors[Math.floor(Math.random() * colors.length)];

  Object.assign(wave.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
    background: color,
    borderRadius: "50%",
    opacity: 0.6,
    transform: "scale(0)",
    pointerEvents: "none",
    animation: "pop-wave 2s ease-out forwards",
  });

  document.body.appendChild(wave);
  wave.addEventListener("animationend", () => wave.remove());
}

// cria uma nova onda a cada 500–1500ms
setInterval(createWave, Math.random() * 1000 + 500);
