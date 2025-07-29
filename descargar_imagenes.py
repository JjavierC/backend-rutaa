import os
import requests

# Lista de URLs de imágenes desde Cluvi
urls = [
    "https://images-mini.cluvi.com/OOF5PVa3zc/w_576_OOF5PVa3zc_soda_hatsu.jpg",
    "https://images-mini.cluvi.com/2Hm1n9tPiK/w_576_2Hm1n9tPiK_te_hatsu.jpg",
    "https://images-mini.cluvi.com/xAnqspc3gP/w_576_xAnqspc3gP_bretana.webp",
    "https://images-mini.cluvi.com/HkncU3WtUe/w_576_HkncU3WtUe_colombiana.jpg",
    "https://images-mini.cluvi.com/i49pgNxUPG/w_576_i49pgNxUPG_canadadry_iconos_cluvi.jpg",
    "https://images-mini.cluvi.com/XrBcqNC9VT/w_576_XrBcqNC9VT_agua_hatsu.png",
    "https://images-mini.cluvi.com/K7nD4iWA58/w_576_K7nD4iWA58_cerezada.jpg",
    "https://images-mini.cluvi.com/NCQuM1P5aN/w_576_NCQuM1P5aN_lulo.jpg",
    "https://images-mini.cluvi.com/bRW0vXW5YL/w_576_bRW0vXW5YL_hierbabuena.jpg",
    "https://images-mini.cluvi.com/mhsArbTOFd/w_576_mhsArbTOFd_maracuya.jpg",
    "https://images-mini.cluvi.com/Q8BTYb8G3g/w_576_Q8BTYb8G3g_limonada_de_coco.jpg",
    "https://images-mini.cluvi.com/8dWqecIY8M/w_576_8dWqecIY8M_mango.jpg",
    "https://images-mini.cluvi.com/CHwAzW4V1j/w_576_CHwAzW4V1j_limonada_de_coco.jpg",
    "https://images-mini.cluvi.com/SKfEIU6BxX/w_576_SKfEIU6BxX_manzana_300.png",
    "https://images-mini.cluvi.com/7wRuk0XIvF/w_576_7wRuk0XIvF_agua-manantial-con-gas.webp",
    "https://images-mini.cluvi.com/E6bKq2UVff/w_576_E6bKq2UVff_hero_image-coca_cola_sabor_original-300ml.png",
    "https://images-mini.cluvi.com/SIwYZxOmAN/w_576_SIwYZxOmAN_agua-sin-gas-500-ml.webp",
    "https://images-mini.cluvi.com/4WHhl125za/w_576_4WHhl125za_hero_ccsa300.png"
]

# Nombres de archivo destino (orden igual a las URLs)
nombres = [
    "soda-hatsu.png", "te-hatsu.png", "bretana.png", "colombiana.png",
    "canada-dry-ginger-aloe.png", "agua-hatsu-300ml.png", "limonada-cerezada.png",
    "lulo.png", "limonada-hierbabuena.png", "maracuya.png", "limonada-de-coco.png",
    "mango.png", "limonada-natural.png", "manzana.png", "agua-nacimiento-gas-300ml.png",
    "coca-cola-original-300ml.png", "agua-manantial-sin-gas-300ml.png", "gaseosa-coca-sin-azucar-300ml.png"
]

# Ruta de destino
directorio = "imgs/bebidas"

os.makedirs(directorio, exist_ok=True)

for url, nombre in zip(urls, nombres):
    ruta_archivo = os.path.join(directorio, nombre)
    try:
        response = requests.get(url)
        if response.status_code == 200:
            with open(ruta_archivo, "wb") as f:
                f.write(response.content)
            print(f"✅ Guardada: {nombre}")
        else:
            print(f"❌ Error al descargar {url}")
    except Exception as e:
        print(f"⚠️ Excepción con {url}: {e}")
