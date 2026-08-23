extends TextureRect # (Atau Control, sesuaikan dengan root node tempat_drop kamu)

@export var target_id: String

func _can_drop_data(_position: Vector2, data: Variant) -> bool:
	# Mengizinkan drop jika data memiliki kunci 'nama_id'
	return data is Dictionary and data.has("nama_id")

func _drop_data(_position: Vector2, data: Variant) -> void:
	var id_papan = ""
	var papan_node = null
	
	if data is Dictionary:
		id_papan = str(data.get("nama_id", ""))
		papan_node = data.get("node", null)
	elif "nama_id" in data:
		id_papan = str(data.nama_id)
		papan_node = data

	var id_papan_bersih = id_papan.to_lower().strip_edges()
	var target_id_bersih = str(target_id).to_lower().strip_edges()
	
	print("--- CEK COCOK ---")
	print("Papan ditarik: '", id_papan_bersih, "'")
	print("Tempat tujuan: '", target_id_bersih, "'")
	
	if id_papan_bersih == target_id_bersih and id_papan_bersih != "":
		print("HASIL: JAWABAN BENAR!")
		
		if papan_node:
			# Pasang papan nama tepat di tengah dudukan BarBawah
			papan_node.global_position = global_position
			# Kunci papannya agar menetap di sana dan tidak bisa digeser lagi
			papan_node.mouse_filter = Control.MOUSE_FILTER_IGNORE
		
		# CARA BARU: Cari script utama di owner / parent paling atas
		var pemilik_level = owner
		if pemilik_level == null:
			pemilik_level = get_tree().current_scene
			
		if pemilik_level and pemilik_level.has_method("tambah_poin_menang"):
			pemilik_level.tambah_poin_menang()
	else:
		print("HASIL: JAWABAN SALAH!")
		var pemilik_level = owner
		if pemilik_level == null:
			pemilik_level = get_tree().current_scene
			
		if pemilik_level and pemilik_level.has_method("kurangi_nyawa"):
			pemilik_level.kurangi_nyawa()
