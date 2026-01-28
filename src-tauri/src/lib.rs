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
    AppHandle, LogicalSize, Manager, Size,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

// Helper function to update menu item checkmarks based on always-on-top state
fn update_menu_checkmarks(app_handle: &AppHandle, is_always_on_top: bool) {
    if let Ok(menu) = app_handle.menu() {
        if let Some(enable_item) = menu.get("enable-always-on-top") {
            if let Some(check_item) = enable_item.as_check_menuitem() {
                let _ = check_item.set_checked(!is_always_on_top);
            }
        }
        if let Some(disable_item) = menu.get("disable-always-on-top") {
            if let Some(check_item) = disable_item.as_check_menuitem() {
                let _ = check_item.set_checked(is_always_on_top);
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            // set a minimum window height and width
            let initial_always_on_top = if let Some(window) = app.get_webview_window("main") {
                let min_height = 181.0;
                let min_width = 216.0;
                let _ = window.set_min_size(Some(Size::Logical(LogicalSize::new(
                    min_width.into(),
                    min_height.into(),
                ))));
                window.is_always_on_top().unwrap_or(false)
            } else {
                false
            };

            // my custom settings menu item
            let enable_always_on_top_menu_item = CheckMenuItemBuilder::new("Enable Always On Top")
                .id("enable-always-on-top")
                .accelerator("CmdOrControl+,")
                .checked(!initial_always_on_top)
                .build(app)?;

            let disable_always_on_top_menu_item =
                CheckMenuItemBuilder::new("Disable Always On Top")
                    .id("disable-always-on-top")
                    .accelerator("CmdOrControl+.")
                    .checked(initial_always_on_top)
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
                if let Some(window) = app_handle.get_webview_window("main") {
                    if event.id() == "enable-always-on-top" {
                        if let Err(e) = window.set_always_on_top(true) {
                            eprintln!("Failed to enable always on top: {}", e);
                        } else {
                            update_menu_checkmarks(&app_handle, true);
                        }
                    } else if event.id() == "disable-always-on-top" {
                        if let Err(e) = window.set_always_on_top(false) {
                            eprintln!("Failed to disable always on top: {}", e);
                        } else {
                            update_menu_checkmarks(&app_handle, false);
                        }
                    }
                }
            });

            // Register global shortcuts
            let app_handle = app.handle().clone();

            // Enable always on top: Cmd/Ctrl + ,
            // Modifiers::META for Mac, Modifiers::CONTROL for others
            // META = Command key on Mac
            let enable_shortcut = if cfg!(target_os = "macos") {
                Shortcut::new(Some(Modifiers::META), Code::Comma)
            } else {
                Shortcut::new(Some(Modifiers::CONTROL), Code::Comma)
            };
            let app_handle_enable = app_handle.clone();
            app.global_shortcut().on_shortcut(
                enable_shortcut,
                move |_app, _shortcut, _event| {
                    if let Some(window) = app_handle_enable.get_webview_window("main") {
                        if let Err(e) = window.set_always_on_top(true) {
                            eprintln!("Failed to enable always on top: {}", e);
                        } else {
                            update_menu_checkmarks(&app_handle_enable, true);
                        }
                    }
                },
            )?;

            // Disable always on top: Cmd/Ctrl + .
            let app_handle_disable = app_handle;
            let disable_shortcut = if cfg!(target_os = "macos") {
                Shortcut::new(Some(Modifiers::META), Code::Period)
            } else {
                Shortcut::new(Some(Modifiers::CONTROL), Code::Period)
            };
            app.global_shortcut().on_shortcut(
                disable_shortcut,
                move |_app, _shortcut, _event| {
                    if let Some(window) = app_handle_disable.get_webview_window("main") {
                        if let Err(e) = window.set_always_on_top(false) {
                            eprintln!("Failed to disable always on top: {}", e);
                        } else {
                            update_menu_checkmarks(&app_handle_disable, false);
                        }
                    }
                },
            )?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
