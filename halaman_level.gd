extends Control

# Fungsi untuk Tombol Level 1 (TextureButton)
func _on_texture_button_pressed() -> void:
	# Mengarah ke halaman game tebak gambar kuda
	get_tree().change_scene_to_file("res://layar_game.tscn")

# Fungsi untuk Tombol Level 2 (TextureButton2)
func _on_texture_button_2_pressed() -> void:
	# Sementara dikosongkan dulu atau bisa diarahkannya ke scene level 2 jika sudah ada
	pass 

# Fungsi untuk Tombol Level 3 (TextureButton3)
func _on_texture_button_3_pressed() -> void:
	# Sementara dikosongkan dulu
	pass
