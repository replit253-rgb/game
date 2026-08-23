extends Node2D

var total_jawaban_benar: int = 0
@export var target_menang: int

# --- SISTEM NYAWA ---
var nyawa_maksimal: int = 3
var nyawa_sekarang: int = 3

func _ready() -> void:
	print("Game Tebak Gambar Dimulai!")
	
	# Reset nyawa ke maksimal setiap level dimulai
	nyawa_sekarang = nyawa_maksimal
	
	# 1. Atur target menang berdasarkan level secara otomatis
	if "layar_game_3" in scene_file_path:
		target_menang = 6
		print("Ini Level 3 - Target Menang: 6")
	elif "layar_game_2" in scene_file_path:
		target_menang = 4
		print("Ini Level 2 - Target Menang: 4")
	else:
		target_menang = 2
		print("Ini Level 1 - Target Menang: 2")
		
	# 2. Acak posisi papan nama di bawah
	acak_posisi_hewan()

# --- FUNGSI BARU UNTUK MENGACAK JENIS DAN GAMBAR HEWAN KELUAR ---
func acak_posisi_hewan() -> void:
	randomize()
	
	var bank_hewan = [
		{"id": "macan_tutul", "gambar": "res://Asset Game Funiko/Object/Macan_Tutul.png"},
		{"id": "anjing_laut", "gambar": "res://Asset Game Funiko/Object/Anjing_Laut.png"},
		{"id": "burung_beo", "gambar": "res://Asset Game Funiko/Object/Burung_Beo.png"},
		{"id": "burung_hantu", "gambar": "res://Asset Game Funiko/Object/Burung_Hantu.png"},
		{"id": "iguana", "gambar": "res://Asset Game Funiko/Object/Iguana.png"},
		{"id": "hyena", "gambar": "res://Asset Game Funiko/Object/Hyena.png"},
		{"id": "kuda", "gambar": "res://Asset Game Funiko/Object/Kuda.png"},
		{"id": "beruang", "gambar": "res://Asset Game Funiko/Object/Beruang.png"}
	]
	
	bank_hewan.shuffle()
	
	var list_dudukan = []
	for anak in get_children():
		if anak.name.begins_with("Object_"): 
			list_dudukan.append(anak)
			
	var jumlah_kebutuhan = list_dudukan.size()
	var hewan_terpilih_level_ini = []
	
	# 1. Tentukan hewan unik untuk tempat drop atas
	for i in range(jumlah_kebutuhan):
		if i < bank_hewan.size():
			var data_hewan = bank_hewan[i]
			var dudukan = list_dudukan[i]
			hewan_terpilih_level_ini.append(data_hewan)
			
			var node_gambar = null
			if dudukan is TextureRect:
				node_gambar = dudukan
			elif dudukan.has_node("TextureRect"):
				node_gambar = dudukan.get_node("TextureRect")
			elif dudukan.has_node("Sprite2D"):
				node_gambar = dudukan.get_node("Sprite2D")
				
			if node_gambar != null:
				node_gambar.texture = load(data_hewan.gambar)
			
			if dudukan.has_node("BarBawah"):
				var node_drop = dudukan.get_node("BarBawah")
				node_drop.target_id = data_hewan.id

	# 2. Ambil semua node nama bawah
	var list_papan = []
	var list_posisi = []
	for anak in get_children():
		if anak.name.begins_with("Nama_"):
			list_papan.append(anak)
			list_posisi.append(anak.global_position)
			
	# 3. Sinkronkan teks papan bawah agar SAMA dengan daftar hewan terpilih atas
	for i in range(list_papan.size()):
		if i < hewan_terpilih_level_ini.size():
			var papan = list_papan[i]
			var data_hewan = hewan_terpilih_level_ini[i]
			
			papan.nama_id = data_hewan.id
				
			var label_teks = null
			if papan.has_node("Label"):
				label_teks = papan.get_node("Label")
			else:
				for cucu in papan.get_children():
					if "Label" in cucu.name:
						label_teks = cucu
						break
			
			if label_teks != null:
				label_teks.text = data_hewan.id.replace("_", " ").capitalize()

	# 4. Kocok posisi koordinatnya agar letak jawabannya acak di layar
	if list_papan.size() > 0:
		list_posisi.shuffle()
		for i in range(list_papan.size()):
			list_papan[i].global_position = list_posisi[i]

# --- FUNGSI JIKA JAWABAN SALAH ---
func kurangi_nyawa() -> void:
	nyawa_sekarang -= 1
	print("Aduh salah! Nyawa berkurang. Sisa nyawa: ", nyawa_sekarang)
	
	# Memutar suara salah jika nodenya ada
	if has_node("%SuaraSalah"):
		get_node("%SuaraSalah").play()
	
	# Mengurangi visual gambar hati di layar
	if has_node("%KontainerNyawa"):
		var kontainer = get_node("%KontainerNyawa")
		var list_hati = kontainer.get_children()
		if list_hati.size() > 0:
			var hati_yang_dihapus = list_hati[list_hati.size() - 1]
			hati_yang_dihapus.queue_free()
			print("Satu gambar hati dihapus.")
	
	# Cek jika nyawa habis
	if nyawa_sekarang <= 0:
		print("Game Over! Nyawa Habis.")
		pemicu_game_over()

# --- FUNGSI JIKA JAWABAN BENAR ---
func tambah_poin_menang() -> void:
	total_jawaban_benar += 1
	print("Poin bertambah! Sekarang: ", total_jawaban_benar, " dari target: ", target_menang)
	
	# Memutar suara benar jika nodenya ada
	if has_node("%SuaraBenar"):
		get_node("%SuaraBenar").play()
	
	# Cek apakah level sudah selesai
	if total_jawaban_benar >= target_menang:
		print("Selamat! Semua jawaban benar. Bersiap pindah level...")
		
		# Beri sedikit jeda 1 detik agar suara/animasi selesai dulu sebelum pindah
		await get_tree().create_timer(1.0).timeout
		
		# AMBIL NAMA SCENE DENGAN CARA YANG LEBIH AMAN
		var scene_aktif = get_tree().current_scene
		var nama_file_scene = ""
		if scene_aktif:
			nama_file_scene = scene_aktif.scene_file_path.to_lower()
		
		print("Jalur scene aktif saat ini: ", nama_file_scene)
		
		# Logika perpindahan level berdasarkan nama file scene
		if "layar_game_3" in nama_file_scene:
			print("Level 3 Selesai! Game Tamat, Kembali ke Menu...")
			get_tree().change_scene_to_file("res://menu_utama.tscn")
		elif "layar_game_2" in nama_file_scene:
			print("Level 2 Selesai! Pindah ke Level 3...")
			get_tree().change_scene_to_file("res://layar_game_3.tscn")
		else:
			# Default ke Level 2 jika terdeteksi di level 1 atau jika jalurnya kosong saat run langsung
			print("Level selesai! Menuju ke Level 2...")
			get_tree().change_scene_to_file("res://layar_game_2.tscn")

# --- FUNGSI GAME OVER ---
func pemicu_game_over() -> void:
	await get_tree().create_timer(0.5).timeout
	get_tree().reload_current_scene() # Mengulang level saat ini jika kalah
