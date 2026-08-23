extends TextureRect

@export var nama_id: String = ""

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		print("Papan ", nama_id, " berhasil diklik!")

func _get_drag_data(_position: Vector2) -> Variant:
	print("Papan ", nama_id, " mulai ditarik (drag)!")

	# Bikin control kosong sebagai base bayangan
	var base_preview = Control.new()
	
	# Bikin papan gambarnya
	var preview = TextureRect.new()
	if has_node("TextureRect"):
		preview.texture = get_node("TextureRect").texture
	elif is_inside_tree() and "texture" in self:
		preview.texture = texture
	
	preview.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	preview.size = size
	
	# Pindahkan posisi gambar agar kursor mouse tepat berada di tengah papan
	preview.position = -size / 2
	base_preview.add_child(preview)
	
	# Masukkan tulisan ke dalam bayangan gambarnya
	var label_asli = null
	if has_node("Label"):
		label_asli = get_node("Label")
	else:
		for anak in get_children():
			if "Label" in anak.name:
				label_asli = anak
				break
				
	if label_asli != null:
		var label_bayangan = label_asli.duplicate()
		label_bayangan.anchors_preset = Control.PRESET_FULL_RECT
		label_bayangan.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		label_bayangan.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		preview.add_child(label_bayangan)
	
	# Gunakan base_preview yang sudah di-offset ke tengah kursor
	set_drag_preview(base_preview)
	
	return {"nama_id": nama_id, "node": self}
