package ru.larkin.profileservice.kafka.provider

//@Provider
//@Named("kafka-event-listener")
//class KafkaEventProvider  RealmChangeEventProvider {
//
//    private static final String KAFKA_BOOTSTRAP_SERVERS = "localhost:9092";
//    private static final String TOPIC = "keycloak-events";
//
//    private KafkaProducer<String, String> producer;
//
//    @Override
//    public void onEvent(RealmChangeEvent event) {
//        if (producer == null) {
//            initProducer();
//         }
//
//        var eventJson = toJson(event);
//        producer.send(new ProducerRecord<>(TOPIC, event.getUserId(), eventJson));
//        }
//
//    private void initProducer() {
//        var props = new Properties();
//        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, KAFKA_BOOTSTRAP_SERVERS);
//        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
//        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
//        producer = new KafkaProducer<>(props);
//          }
//     }
//}