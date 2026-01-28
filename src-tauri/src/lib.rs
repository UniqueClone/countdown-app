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

use std::sync::{Arc, Mutex};
use tauri::{
    menu::{AboutMetadata, MenuBuilder, MenuItem, MenuItemBuilder, SubmenuBuilder},
    LogicalSize, Manager, Size,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

type MenuItemPair<R> = (MenuItem<R>, MenuItem<R>);

fn update_always_on_top_checkmarks<R: tauri::Runtime>(
    menu_items: &Arc<Mutex<MenuItemPair<R>>>,
    is_enabled: bool,
) {
    if let Ok(items) = menu_items.lock() {
        let enable_text = if is_enabled {
            "✓ Enable Always On Top"
        } else {
            "Enable Always On Top"
        };
        let _ = items.0.set_text(enable_text);

        let disable_text = if !is_enabled {
            "✓ Disable Always On Top"
        } else {
            "Disable Always On Top"
        };
        let _ = items.1.set_text(disable_text);
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
            if let Some(window) = app.get_webview_window("main") {
                let min_height = 181.0;
                let min_width = 216.0;
                let _ = window.set_min_size(Some(Size::Logical(LogicalSize::new(
                    min_width.into(),
                    min_height.into(),
                ))));
            }
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

            // Store menu items for updating checkmarks
            let menu_items = Arc::new(Mutex::new((
                enable_always_on_top_menu_item.clone(),
                disable_always_on_top_menu_item.clone(),
            )));

            // Set initial checkmarks based on current always-on-top state
            if let Some(window) = app.get_webview_window("main") {
                let is_always_on_top = window.is_always_on_top().unwrap_or(false);
                update_always_on_top_checkmarks(&menu_items, is_always_on_top);
            }

            // listen for menu item click events
            let app_handle = app.handle().clone();
            let menu_items_for_events = menu_items.clone();
            app.on_menu_event(move |_app, event| {
                let app_handle = app_handle.clone();
                if let Some(window) = app_handle.get_webview_window("main") {
                    let current_state = window.is_always_on_top().unwrap_or(false);

                    if event.id() == "enable-always-on-top" {
                        if !current_state {
                            if let Err(e) = window.set_always_on_top(true) {
                                eprintln!("Failed to enable always on top: {}", e);
                            }
                        }
                        // Always update checkmarks to reflect the actual state
                        let new_state = window.is_always_on_top().unwrap_or(false);
                        update_always_on_top_checkmarks(&menu_items_for_events, new_state);
                    } else if event.id() == "disable-always-on-top" {
                        if current_state {
                            if let Err(e) = window.set_always_on_top(false) {
                                eprintln!("Failed to disable always on top: {}", e);
                            }
                        }
                        // Always update checkmarks to reflect the actual state
                        let new_state = window.is_always_on_top().unwrap_or(false);
                        update_always_on_top_checkmarks(&menu_items_for_events, new_state);
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
            let menu_items_for_enable = menu_items.clone();
            app.global_shortcut().on_shortcut(enable_shortcut, move |_app, _shortcut, _event| {
                if let Some(window) = app_handle_enable.get_webview_window("main") {
                    let current_state = window.is_always_on_top().unwrap_or(false);
                    if !current_state {
                        if let Err(e) = window.set_always_on_top(true) {
                            eprintln!("Failed to enable always on top: {}", e);
                        }
                    }
                    // Always update checkmarks to reflect the actual state
                    let new_state = window.is_always_on_top().unwrap_or(false);
                    update_always_on_top_checkmarks(&menu_items_for_enable, new_state);
                }
            })?;

            // Disable always on top: Cmd/Ctrl + .
            let app_handle_disable = app_handle;
            let menu_items_for_disable = menu_items.clone();
            let disable_shortcut = if cfg!(target_os = "macos") {
                Shortcut::new(Some(Modifiers::META), Code::Period)
            } else {
                Shortcut::new(Some(Modifiers::CONTROL), Code::Period)
            };
            app.global_shortcut().on_shortcut(disable_shortcut, move |_app, _shortcut, _event| {
                if let Some(window) = app_handle_disable.get_webview_window("main") {
                    let current_state = window.is_always_on_top().unwrap_or(false);
                    if current_state {
                        if let Err(e) = window.set_always_on_top(false) {
                            eprintln!("Failed to disable always on top: {}", e);
                        }
                    }
                    // Always update checkmarks to reflect the actual state
                    let new_state = window.is_always_on_top().unwrap_or(false);
                    update_always_on_top_checkmarks(&menu_items_for_disable, new_state);
                }
            })?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
