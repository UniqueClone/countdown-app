// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

// #[cfg(target_os = "macos")]
// const APPLICATION_DIRS: &[&str] = &[
//     "/Applications",
//     "/Applications/Utilities",
//     "/System/Applications",
//     "/Users/*/Applications",
//     "/Users/*/Applications/Utilities",
// ];

// #[cfg(target_os = "windows")]
// const APPLICATION_DIRS: &[&str] = &[
//     "C:\\Program Files",
//     "C:\\Program Files (x86)",
//     "C:\\Windows\\System32",
//     "C:\\Windows\\SysWOW64",
//     "C:\\Users\\*\\AppData\\Local",
//     "C:\\Users\\*\\AppData\\Roaming",
// ];

// #[cfg(target_os = "linux")]
// const APPLICATION_DIRS: &[&str] = &[
//     "/usr/bin",
//     "/usr/sbin",
//     "/usr/local/bin",
//     "/usr/local/sbin",
//     "/bin",
//     "/sbin",
//     "/opt",
//     "/usr/share/applications",
// ];

use tauri::{
    menu::{AboutMetadata, MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            // my custom settings menu item
            let enable_always_on_top_menu_item = MenuItemBuilder::new("Enable Always On Top")
                .id("enable-always-on-top")
                .accelerator("CmdOrControl+,")
                .build(app)?;

            let disable_always_on_top_menu_item = MenuItemBuilder::new("Disable Always On Top")
                .id("disable-always-on-top")
                .accelerator("CmdOrControl+.")
                .build(app)?;

            // my custom app submenu
            let app_submenu = SubmenuBuilder::new(app, "App")
                .about(Some(AboutMetadata {
                    ..Default::default()
                }))
                .separator()
                .services()
                .separator()
                .hide()
                .hide_others()
                .quit()
                .build()?;

            // only include hide and hide_others menu items on macOS
            let view_submenu = if cfg!(target_os = "macos") {
                SubmenuBuilder::new(app, "View")
                    .item(&enable_always_on_top_menu_item)
                    .item(&disable_always_on_top_menu_item)
                    .separator()
                    .build()?
            } else {
                SubmenuBuilder::new(app, "View")
                    .item(&enable_always_on_top_menu_item)
                    .item(&disable_always_on_top_menu_item)
                    .build()?
            };

            // build the menu
            // only include the app submenu on macOS
            let menu = if cfg!(target_os = "macos") {
                MenuBuilder::new(app)
                    .items(&[
                        &app_submenu as &dyn tauri::menu::IsMenuItem<_>,
                        &view_submenu as &dyn tauri::menu::IsMenuItem<_>,
                    ])
                    .build()
            } else {
                MenuBuilder::new(app)
                    .items(&[&view_submenu as &dyn tauri::menu::IsMenuItem<_>])
                    .build()
            };

            // set the menu
            app.set_menu(menu.unwrap())?;

            // listen for menu item click events
            let app_handle = app.handle().clone();
            app.on_menu_event(move |_app, event| {
                let app_handle = app_handle.clone();
                let window = app_handle.get_webview_window("main").unwrap();
                if event.id() == "enable-always-on-top" {
                    if let Err(e) = window.set_always_on_top(true) {
                        eprintln!("Failed to enable always on top: {}", e);
                    }
                } else if event.id() == "disable-always-on-top" {
                    if let Err(e) = window.set_always_on_top(false) {
                        eprintln!("Failed to disable always on top: {}", e);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
