En el siguiente proyecto se creó un servicio que representa el Cliente el cual podrá enviar por medio de un REST un documento o muchos, el servicio de Revisor Documental llamado "acepta" lo recepcionará  y enviará el estado de en proceso, después realizará un envío a una cola de Rabbitmq la cual luego se hará un consumo en un tiempo aleatorio de 10 minutos. Además se otorgará aleatoriamente un estado ya sea de cancelado o aceptado y se enviará a la base de datos. El servicio de Cliente consumirá automáticamente de una cola para consultar el estado de revisión del documento siendo estos estados "en proceso", "aceptado", "cancelado". El Servicio de Revisor Documental subirá a la base de datos el documento que se encuentre en estado de "aceptado".
Se presenta el diagrama de Componentes para mejor visualización del proyecto:

@startuml
component "Cliente1"
component "Cliente2"
component "BD"
component "Revisión Documental"
[Revisión Documental] -> [BD] : Envio Doc.
[Revisión Documental] <- [BD] : Respuesta de consulta
[colaDocumentos] -down-> [Revisión Documental]
[colaDocumentos] <-down- [Revisión Documental]
[colaRespuesta] <-down-> [Cliente1] : consulta
[colaRespuesta] <-down-> [Cliente2] : consulta
[colaRespuesta] <-down-> [Revisión Documental] : Respuesta
Cliente1 -> "Revisión Documental" : Rest - Envío
Cliente2 -> "Revisión Documental" : Rest - Envío
@enduml
