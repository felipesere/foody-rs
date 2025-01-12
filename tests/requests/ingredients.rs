// use foody::app::App;
// use loco_rs::testing;
// use serial_test::serial;

// #[tokio::test]
// #[serial]
// async fn can_request_root() {
//     testing::request::request::<App, _, _>(|request, _ctx| async move {
//         let res = request.get("/ingredients").await;
//         assert_eq!(res.status_code(), 200);
//         assert_eq!(res.text(), "hello");
//     })
//     .await;
// }
