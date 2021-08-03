const express = require('express');
const { Client } = require('pg');
const app = express();
const port = process.env.PORT || 3000
const { WebhookClient } = require("dialogflow-fulfillment");
const { response } = require('express');

let doctor_id = 2

app.get('/', function (req, res) {
  res.send('Hello World')
});
app.post('/webhook', express.json(),function (req, res) {
  const agent= new WebhookClient({ request:req, response:res });
  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
 

  function inicio(agent) {
    agent.add(`estoy respondiendo desde webhook`);
  }
  async function pedir_datos(agent) {
    let respuesta= 'los doctores con los que puede reservar son: '
    let client = new Client({
      connectionString: process.env.DATABASE_URL || "postgres://mwvdksbwzjyruc:2c8b2f19ed3a45d4ac0d8fddb4f119edaf920dd9d189e9a73422c963dd1b1132@ec2-35-174-56-18.compute-1.amazonaws.com:5432/dbvn1mv6hhgivi",
      ssl: {
        rejectUnauthorized: false
      }
    });
    client.connect()
    await client.query(`select doctor.nombre,doctor.apellido, tipo_doctor.cantidad from doctor, tipo_doctor 
    where doctor.id in( 
    select doctor_id from tipo_doctor where tipo_id in (
      select id from tipo where nombre = 'covid') ) and doctor.id = tipo_doctor.doctor_id`)
    .then(response => {
        //console.log(response.rows.length)
        for (let index = 0; index < response.rows.length; index++) {
          respuesta = respuesta+ (index+1) + ') '+ response.rows[index].nombre+' '+
          response.rows[index].apellido +'  tiene '+response.rows[index].cantidad+ ' cupos     '
      } 
        
        
        client.end()
        
    })
    .catch(err => {
        client.end()
    })


    agent.add(respuesta);


  }
  function final_comun(agent) {
    agent.add(`usted probablemente tenga resfriado comun`);
  }
  function finalcovid(agent) {
    agent.add(`usted probablemente si tenga covid, desea realizar una prueba de covid en nuestra clinica?`);
  }
  function elegir(agent) {
    doctor_id = agent.parameters.numero
    console.log(agent.parameters)
    agent.add(`deme su nombre, apellido, telefono`);
  }
 
  async function dar_datos(agent) {
    let nombre
    let telefono
    let apellido
    let persona_id
    nombre = agent.parameters.nombre.name
    telefono = agent.parameters.telefono
    apellido = agent.parameters.persona_apellido[0]
    apellido = apellido +' ' +agent.parameters.persona_apellido[1]
    console.log(apellido)
    console.log(doctor_id)
    let client = new Client({
      connectionString: process.env.DATABASE_URL || "postgres://mwvdksbwzjyruc:2c8b2f19ed3a45d4ac0d8fddb4f119edaf920dd9d189e9a73422c963dd1b1132@ec2-35-174-56-18.compute-1.amazonaws.com:5432/dbvn1mv6hhgivi",
      ssl: {
        rejectUnauthorized: false
      }
    });
    client.connect()
    await client.query(`select id from persona where nombre =\'`+nombre + `\' 
    and apellido = \'`+apellido+`\'`)
    .then(response => {
        console.log(response.rows)
         
        if (response.rows.length == 0){
          console.log('no tiene datos')
          let client = new Client({
            connectionString: process.env.DATABASE_URL || "postgres://mwvdksbwzjyruc:2c8b2f19ed3a45d4ac0d8fddb4f119edaf920dd9d189e9a73422c963dd1b1132@ec2-35-174-56-18.compute-1.amazonaws.com:5432/dbvn1mv6hhgivi",
            ssl: {
              rejectUnauthorized: false
            }
          });
          client.connect()
          client.query(`INSERT INTO public.persona(
          nombre, apellido, telefono)
         VALUES (\'`+ nombre+`\',\'`+apellido+`\',`+telefono+`)`)
          .then(response => {
            
            console.log('lo hizo')
              client.end()
          })
          .catch(err => {
              client.end()
          })

          let clien = new Client({
            connectionString: process.env.DATABASE_URL || "postgres://mwvdksbwzjyruc:2c8b2f19ed3a45d4ac0d8fddb4f119edaf920dd9d189e9a73422c963dd1b1132@ec2-35-174-56-18.compute-1.amazonaws.com:5432/dbvn1mv6hhgivi",
            ssl: {
              rejectUnauthorized: false
            }
          });
          clien.connect()
         clien.query(`select id from persona where nombre =\'`+nombre + `\' 
         and apellido = \'`+apellido+`\'`)
          .then(response => {
            
            console.log('lo inserto y pide')
            persona_id = response.rows[0].id
          let client = new Client({
            connectionString: process.env.DATABASE_URL || "postgres://mwvdksbwzjyruc:2c8b2f19ed3a45d4ac0d8fddb4f119edaf920dd9d189e9a73422c963dd1b1132@ec2-35-174-56-18.compute-1.amazonaws.com:5432/dbvn1mv6hhgivi",
            ssl: {
              rejectUnauthorized: false
            }
          });
          let hoy = new Date()
          let fecha = hoy.getFullYear()+ '-' + ( hoy.getMonth() + 1 ) + '-' + (hoy.getDate()+1);
          let hora = hoy.getHours()+':'+hoy.getMinutes()+':'+ hoy.getSeconds()
          client.connect()
         client.query(`INSERT INTO public.cita(
          fecha, hora, persona_id, tipo_id, doctor_id)
         VALUES ( \'`+fecha+`\',\'`+hora+`\',`+persona_id+ `, 1,`+doctor_id+`);`)
          .then(response => {
            
            console.log('lo hizo adentro adentro')
              client.end()
          })
          .catch(err => {
              client.end()
          })
              clien.end()
          })
          .catch(err => {
              clien.end()
          })
          
        }else{
          persona_id = response.rows[0].id
          let client = new Client({
            connectionString: process.env.DATABASE_URL || "postgres://mwvdksbwzjyruc:2c8b2f19ed3a45d4ac0d8fddb4f119edaf920dd9d189e9a73422c963dd1b1132@ec2-35-174-56-18.compute-1.amazonaws.com:5432/dbvn1mv6hhgivi",
            ssl: {
              rejectUnauthorized: false
            }
          });
          let hoy = new Date()
          let hora = hoy.getHours()+':'+hoy.getMinutes()+':'+ hoy.getSeconds()
          let fecha = hoy.getFullYear()+ '-' + ( hoy.getMonth() + 1 ) + '-' + (hoy.getDate()+1);
          client.connect()
          client.query(`INSERT INTO public.cita(
          fecha, hora, persona_id, tipo_id, doctor_id)
         VALUES ( \'`+fecha+`\',\'`+hora+`\',`+persona_id+ `, 1,`+doctor_id+`);`)
          .then(response => {
            
            console.log('lo hizo')
              client.end()
          })
          .catch(err => {
              client.end()
          })
        }
               
        client.end()
        
    })
    .catch(err => {
        client.end()
    })


    agent.add(`se registro su cita para mañana miercoles 3 de agosto a las 8 am`);
  }
  async function tipo_atencion(agent){
    
    let client = new Client({
      connectionString: process.env.DATABASE_URL || "postgres://mwvdksbwzjyruc:2c8b2f19ed3a45d4ac0d8fddb4f119edaf920dd9d189e9a73422c963dd1b1132@ec2-35-174-56-18.compute-1.amazonaws.com:5432/dbvn1mv6hhgivi",
      ssl: {
        rejectUnauthorized: false
      }
    });
    client.connect()
   await client.query('SELECT * FROM tipo')
    .then(response => {
      for (let index = 0; index < response.rows.length; index++) {
        if (index == response.rows.length-1) {
          respuesta = respuesta+response.rows[index].nombre
        }else{
          respuesta = respuesta+response.rows[index].nombre +`, `
  
        }
      }   
      console.log(respuesta)
        client.end()
    })
    .catch(err => {
        client.end()
    })
    
    agent.add(respuesta)
  }

  let intentMap = new Map();
  intentMap.set('inicio', inicio);
  intentMap.set('pedir_datos', pedir_datos);
  intentMap.set('dar_datos', dar_datos);
  intentMap.set('tipo_atencion', tipo_atencion);
  intentMap.set('final_comun', final_comun);
  intentMap.set('finalcovid', finalcovid);
  intentMap.set('elegir', elegir);
  agent.handleRequest(intentMap);

});
 
app.listen(port,()=>{

    console.log("estamos en el servidor");
      
  
   



});
async function consulta(){
  let client = new Client({
    connectionString: process.env.DATABASE_URL || "postgres://mwvdksbwzjyruc:2c8b2f19ed3a45d4ac0d8fddb4f119edaf920dd9d189e9a73422c963dd1b1132@ec2-35-174-56-18.compute-1.amazonaws.com:5432/dbvn1mv6hhgivi",
    ssl: {
      rejectUnauthorized: false
    }
  });
  client.connect()
  await client.query('SELECT * FROM tipo')
  .then(response => {
      //console.log(response.rows.length)
      console.log(response.rows[0].nombre)
      client.end()
  })
  .catch(err => {
      client.end()
  })
}
async function pedirID(dato){
  let client = new Client({
    connectionString: process.env.DATABASE_URL || "postgres://mwvdksbwzjyruc:2c8b2f19ed3a45d4ac0d8fddb4f119edaf920dd9d189e9a73422c963dd1b1132@ec2-35-174-56-18.compute-1.amazonaws.com:5432/dbvn1mv6hhgivi",
    ssl: {
      rejectUnauthorized: false
    }
  });
  let valor
  client.connect()
  await client.query('SELECT id FROM tipo where nombre = \''+dato+'\'')
  .then(response => {
      //console.log(response.rows.length)
     
      valor = response.rows[0].id
      
      client.end()
      
  })
  .catch(err => {
      client.end()
  })
  return valor
}