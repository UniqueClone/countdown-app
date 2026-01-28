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
    menu::{AboutMetadata, CheckMenuItemBuilder, MenuBuilder, SubmenuBuilder},
    LogicalSize, Manager, Size,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            // set a minimum window height and width
            if let Some(window) = app.get_webview_window("main") {
                let min_height = 181.0;
                let min_width = 216.0;
                let _ = window.set_min_size(Some(Size::Logical(LogicalSize::new(
                    min_width.into(),
                    min_height.into(),
                ))));
            }
            // my custom settings menu item
            let always_on_top_menu_item = CheckMenuItemBuilder::new("Always On Top")
                .id("always-on-top")
                .accelerator("CmdOrControl+T")
                .checked(false)
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
                    .item(&always_on_top_menu_item)
                    .separator()
                    .build()?
            } else {
                SubmenuBuilder::new(app, "View")
                    .item(&always_on_top_menu_item)
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
                if event.id() == "always-on-top" {
                    // Get the current always-on-top state
                    if let Ok(current_state) = window.is_always_on_top() {
                        let new_state = !current_state;
                        if let Err(e) = window.set_always_on_top(new_state) {
                            eprintln!("Failed to toggle always on top: {}", e);
                        }
                        // Update the check mark on the menu item
                        if let Some(menu_item) = app_handle.menu().unwrap().get("always-on-top") {
                            if let Some(check_item) = menu_item.as_check_menuitem() {
                                if let Err(e) = check_item.set_checked(new_state) {
                                    eprintln!("Failed to update menu item check state: {}", e);
                                }
                            }
                        }
                    }
                }
            });

            // Register global shortcuts
            let app_handle = app.handle().clone();
            
            // Toggle always on top: Cmd/Ctrl + T
            // Modifiers::META for Mac, Modifiers::CONTROL for others
            // META = Command key on Mac
            let toggle_shortcut = if cfg!(target_os = "macos") {
                Shortcut::new(Some(Modifiers::META), Code::KeyT)
            } else {
                Shortcut::new(Some(Modifiers::CONTROL), Code::KeyT)
            };
            app.global_shortcut().on_shortcut(toggle_shortcut, move |_app, _shortcut, _event| {
                if let Some(window) = app_handle.get_webview_window("main") {
                    if let Ok(current_state) = window.is_always_on_top() {
                        let new_state = !current_state;
                        if let Err(e) = window.set_always_on_top(new_state) {
                            eprintln!("Failed to toggle always on top: {}", e);
                        }
                        // Update the check mark on the menu item
                        if let Some(menu_item) = app_handle.menu().unwrap().get("always-on-top") {
                            if let Some(check_item) = menu_item.as_check_menuitem() {
                                if let Err(e) = check_item.set_checked(new_state) {
                                    eprintln!("Failed to update menu item check state: {}", e);
                                }
                            }
                        }
                    }
                }
            })?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
