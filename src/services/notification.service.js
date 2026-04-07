import eventEmitter, { EVENTS } from './event.service.js';


export function initializeNotificationListeners() {

  eventEmitter.on(EVENTS.USER_REGISTERED, (data) => {
    console.log('\n📝 [EVENT] Usuario Registrado');
    console.log(`   Email: ${data.email}`);
    console.log(`   Nombre: ${data.name}`);
    console.log(`   Rol: ${data.role}`);
    console.log(`   Estado: ${data.status}`);
    console.log(`   A las: ${data.timestamp}\n`);
  });


  eventEmitter.on(EVENTS.USER_VERIFIED, (data) => {
    console.log('\n✅ [EVENT] Usuario Verificado');
    console.log(`   Email: ${data.email}`);
    console.log(`   Verificado a las: ${data.verifiedAt}`);
    console.log(`   Timestamp: ${data.timestamp}\n`);
  });


  eventEmitter.on(EVENTS.USER_INVITED, (data) => {
    console.log('\n👥 [EVENT] Usuario Invitado');
    console.log(`   Email: ${data.email}`);
    console.log(`   Invitado por: ${data.invitedBy}`);
    console.log(`   Invitado a las: ${data.invitedAt}`);
    console.log(`   Timestamp: ${data.timestamp}\n`);
  });


  eventEmitter.on(EVENTS.USER_DELETED, (data) => {
    console.log('\n🗑️ [EVENT] Usuario Eliminado');
    console.log(`   Email: ${data.email}`);
    console.log(`   Eliminado a las: ${data.deletedAt}`);
    console.log(`   Tipo: ${data.deleteType} delete`);
    console.log(`   Timestamp: ${data.timestamp}\n`);
  });

  console.log('✓ Listeners de notificación inicializados');
}
