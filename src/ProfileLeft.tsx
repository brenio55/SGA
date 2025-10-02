import "./ProfileLeft.css"
import "./classes/UserProfile"
import { UserProfile } from "./classes/UserProfile";

function ProfileLeft() {
    function exibirDataHora() {
        const agora = new Date(); // Cria um objeto Date com a data e hora atuais
        return agora;
    }
    // Chama a função para exibir a data e hora ao carregar a página
    let first = exibirDataHora()

    const user = new UserProfile(
      "Brenio Hallison Arruda Menezes Filho",
      "Analista de TI",
      "Departamento da Tecnologia da Informação",
      ""
    )

  return (
    <>
        <section className="profileLeft">
            <div className="companyLogo"></div>

            <div className="profileImage">
              <img src="sasd.png" alt="" />
            </div>
            <div className="profileInformation">
               <h3 className="profileFullName">{user.fullName}</h3>
               <p className="profileRole">{user.role}</p>
               <p className="profileDept">{user.department}</p>
            </div>
        </section>
    </>
  )
}

export default ProfileLeft
