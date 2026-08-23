extends Control

func _ready():
	print("Menu Utama Terbuka!")

# Fungsi untuk menangani klik dari TextureButton baru kamu
func _on_texture_button_pressed():
	get_tree().change_scene_to_file("res://halaman_level.tscn")


func _on_keluar_button_pressed() -> void:
	get_tree().quit() # Kode untuk menutup dan keluar dari game
