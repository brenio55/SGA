import "./Header.css"

function Header() {
    function exibirDataHora() {
        const agora = new Date(); // Cria um objeto Date com a data e hora atuais
        return agora;
    }
    // Chama a função para exibir a data e hora ao carregar a página
    let first = exibirDataHora()

  return (
    <>
      <header>
         <div className="topInfo">
            <p>DiVSeC - Cloud Technology</p>
            <div className="data-hora">{first.toString()}</div>
         </div>
         
      </header>
    </>
  )
}

export default Header
