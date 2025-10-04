import "./Notification.css"

function Notification(){
    

    return (
    <>
        <div className="notificationDiv">
            <div className="leftNotificationSection">
                <h4>Notificação Muito Muito Importante</h4>
                <p className="notificationDepartment">RH</p>
            </div>
            <div className="rightNotificationSection">                
                <h3>17:45</h3>
                <p className="notificationType">Normal</p>
            </div>
            
        </div>    
    </>
    )
}

export default Notification