import cv2
import time
import os
import threading
import winsound
import random
import numpy as np

# Lista de perguntas
PERGUNTAS = [
    {
        "pergunta": "Qual a capital do Brasil?",
        "respostas": ["brasilia", "brasília"],
        "dica": "Começa com B"
    },
    {
        "pergunta": "Quantos planetas tem no sistema solar?",
        "respostas": ["8", "oito"],
        "dica": "É um número par"
    },
    {
        "pergunta": "Qual o maior oceano do mundo?",
        "respostas": ["pacífico", "pacifico"],
        "dica": "Começa com P"
    },
    {
        "pergunta": "Em que ano o homem pisou na lua?",
        "respostas": ["1969"],
        "dica": "Termina com 69"
    },
    {
        "pergunta": "Qual a fórmula da água?",
        "respostas": ["h2o", "H2O"],
        "dica": "2 hidrogênios e 1 oxigênio"
    }
]

# Mapeamento de expressões (sem NOJO)
EXPRESSOES = {
    "FELIZ": {"emoji": "😊", "dica": "SORRIA mostrando os dentes!"},
    "BRAVO": {"emoji": "😠", "dica": "FRANZA A TESTA e aperte os olhos!"},
    "TRISTE": {"emoji": "😢", "dica": "ABRA BEM OS OLHOS e faça boca de triste!"}
}

class DetectorSorriso:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.smile_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_smile.xml'
        )
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
        self.camera = None
        self.som_tocando = False
        self.ultima_expressao = "NEUTRO"
        self.historico_expressoes = []
        
    def iniciar_camera(self):
        try:
            self.camera = cv2.VideoCapture(0)
            if not self.camera.isOpened():
                print("❌ Não foi possível abrir a câmera!")
                return False
            print("✅ Câmera aberta com sucesso!")
            return True
        except Exception as e:
            print(f"❌ Erro ao abrir câmera: {e}")
            return False
    
    def fechar_camera(self):
        if self.camera:
            self.camera.release()
            cv2.destroyAllWindows()
    
    def detectar_expressao_melhorada(self, frame):
        """Detecta expressão facial (FELIZ, BRAVO, TRISTE)"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5, minSize=(100, 100))
        
        if len(faces) == 0:
            return "NADA", frame
        
        expressao_detectada = "NEUTRO"
        
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            roi_gray = gray[y:y+h, x:x+w]
            roi_color = frame[y:y+h, x:x+w]
            
            # Detecta sorriso
            smiles = self.smile_cascade.detectMultiScale(
                roi_gray, 1.8, 20, minSize=(25, 25)
            )
            
            # Detecta olhos
            eyes = self.eye_cascade.detectMultiScale(
                roi_gray, 1.1, 5, minSize=(20, 20)
            )
            
            # Região da boca
            boca_y = int(h * 0.6)
            boca_h = int(h * 0.3)
            boca_x = int(w * 0.2)
            boca_w = int(w * 0.6)
            
            intensidade_boca = 0
            if boca_y + boca_h < roi_gray.shape[0]:
                roi_boca = roi_gray[boca_y:boca_y+boca_h, boca_x:boca_x+boca_w]
                intensidade_boca = np.mean(roi_boca)
            
            # ===== DETECÇÃO DE EXPRESSÕES =====
            
            # 1. FELIZ: Sorriso detectado OU boca clara
            if len(smiles) > 0 or intensidade_boca > 150:
                expressao_detectada = "FELIZ"
                cv2.putText(frame, "😊 FELIZ!", 
                           (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                for (sx, sy, sw, sh) in smiles:
                    cv2.rectangle(roi_color, (sx, sy), (sx+sw, sy+sh), (0, 255, 0), 2)
            
            # 2. BRAVO ou TRISTE (quando não tem sorriso)
            elif len(eyes) >= 2 and intensidade_boca < 130:
                # Calcula área dos olhos
                area_olhos = []
                for (ex, ey, ew, eh) in eyes:
                    area_olhos.append(ew * eh)
                area_media_olhos = sum(area_olhos) / len(area_olhos) if area_olhos else 0
                
                # BRAVO: olhos pequenos (franzidos)
                if area_media_olhos < 900:
                    expressao_detectada = "BRAVO"
                    cv2.putText(frame, "😠 BRAVO!", 
                               (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                # TRISTE: olhos grandes (arregalados)
                elif area_media_olhos > 1400:
                    expressao_detectada = "TRISTE"
                    cv2.putText(frame, "😢 TRISTE!", 
                               (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
                
                # NEUTRO: entre os dois
                else:
                    expressao_detectada = "NEUTRO"
                    cv2.putText(frame, "😐 NEUTRO", 
                               (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (128, 128, 128), 2)
            
            # 3. NEUTRO: sem sorriso e sem olhos suficientes
            else:
                expressao_detectada = "NEUTRO"
                cv2.putText(frame, "😐 NEUTRO", 
                           (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (128, 128, 128), 2)
            
            # Desenha os olhos
            for (ex, ey, ew, eh) in eyes:
                cv2.rectangle(roi_color, (ex, ey), (ex+ew, ey+eh), (0, 255, 255), 2)
            
            # Mostra informações na tela
            cv2.putText(frame, f"Expressao: {expressao_detectada}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            if intensidade_boca > 0:
                cv2.putText(frame, f"Boca: {int(intensidade_boca)}", 
                           (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
            
            return expressao_detectada, frame
        
        return "NADA", frame
    
    def esperar_expressao_inicial(self, tempo_necessario=5):
        """Espera o usuário fazer uma expressão por 5 segundos para iniciar o timer"""
        print("\n" + "="*60)
        print("🎭 PARA INICIAR O TIMER:")
        print("="*60)
        print("Faça UMA das expressões abaixo por 5 segundos:")
        print("   😊 FELIZ  - SORRIA mostrando os dentes!")
        print("   😠 BRAVO  - FRANZA A TESTA e aperte os olhos!")
        print("   😢 TRISTE - ABRA BEM OS OLHOS e faça boca de triste!")
        print("\n💡 Dica: A expressão é SORTEADA automaticamente!")
        print("   Pressione 'q' para cancelar\n")
        
        if not self.iniciar_camera():
            return False
        
        expressoes_disponiveis = list(EXPRESSOES.keys())
        expressao_alvo = random.choice(expressoes_disponiveis)
        
        print(f"🎯 EXPRESSÃO SORTEADA: {EXPRESSOES[expressao_alvo]['emoji']} {expressao_alvo}")
        print(f"   💡 {EXPRESSOES[expressao_alvo]['dica']}")
        print(f"⏱️  Mantenha por {tempo_necessario} segundos!\n")
        
        tempo_expressao = 0
        expressao_iniciada = False
        
        while True:
            ret, frame = self.camera.read()
            if not ret:
                print("⚠️ Erro ao ler frame da câmera!")
                time.sleep(0.1)
                continue
            
            frame = cv2.flip(frame, 1)
            expressao, frame_processado = self.detectar_expressao_melhorada(frame)
            
            # Mostra a expressão alvo em destaque
            cv2.putText(frame_processado, f"🎯 EXPRESSAO ALVO: {EXPRESSOES[expressao_alvo]['emoji']} {expressao_alvo}", 
                       (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
            
            # Mostra a dica
            cv2.putText(frame_processado, f"💡 {EXPRESSOES[expressao_alvo]['dica']}", 
                       (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
            
            # Verifica se a expressão atual é a alvo
            if expressao == expressao_alvo:
                if not expressao_iniciada:
                    expressao_iniciada = True
                    tempo_expressao = time.time()
                    print(f"\n🎭 {EXPRESSOES[expressao_alvo]['emoji']} Expressão detectada! Continue...")
                
                tempo_atual = time.time()
                tempo_continuo = tempo_atual - tempo_expressao
                
                cv2.putText(frame_processado, f"⏱️ Tempo: {tempo_continuo:.1f}s / {tempo_necessario}s", 
                           (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                progresso = int((tempo_continuo / tempo_necessario) * 20)
                barra = "█" * min(progresso, 20) + "░" * max(0, 20 - progresso)
                cv2.putText(frame_processado, f"[{barra}]", 
                           (10, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                
                if tempo_continuo >= tempo_necessario:
                    print(f"\n✅ EXPRESSÃO {expressao_alvo} MANTIDA POR {tempo_necessario} SEGUNDOS! 🎉")
                    print("⏰ Timer iniciado!")
                    self.fechar_camera()
                    return True
            else:
                if expressao_iniciada:
                    print(f"\n⚠️ Mudou a expressão! Faça {EXPRESSOES[expressao_alvo]['emoji']} novamente...")
                    print(f"   💡 {EXPRESSOES[expressao_alvo]['dica']}")
                expressao_iniciada = False
                tempo_expressao = 0
            
            cv2.imshow('🎭 FACA A EXPRESSAO PARA INICIAR!', frame_processado)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\n❌ Cancelado!")
                self.fechar_camera()
                return False
        
        self.fechar_camera()
        return False
    
    def fazer_pergunta(self):
        """Faz uma pergunta de conhecimentos gerais"""
        print("\n" + "="*50)
        print("🤔 RESPONDA A PERGUNTA!")
        print("="*50)
        
        pergunta = random.choice(PERGUNTAS)
        print(f"\n📝 {pergunta['pergunta']}")
        print(f"💡 Dica: {pergunta['dica']}")
        print("-" * 40)
        
        tentativas = 2
        while tentativas > 0:
            resposta = input("Sua resposta: ").strip().lower()
            
            if resposta in pergunta['respostas']:
                print("\n✅ RESPOSTA CORRETA! 🎉")
                return True
            else:
                tentativas -= 1
                if tentativas > 0:
                    print(f"❌ Errada! {tentativas} tentativa(s) restante(s)")
                else:
                    print("\n❌ VOCÊ ERROU A PERGUNTA!")
                    print("🔄 TIMER VAI SER REINICIADO!")
                    return False
        
        return False
    
    def tocar_som_loop(self, arquivo_som):
        """Toca o som em loop usando winsound"""
        try:
            self.som_tocando = True
            print(f"🔊 Som tocando em loop...")
            
            while self.som_tocando:
                winsound.PlaySound(arquivo_som, winsound.SND_FILENAME)
                if not self.som_tocando:
                    break
                time.sleep(0.1)
                    
        except Exception as e:
            print(f"❌ Erro no som: {e}")
            self.tocar_beep()
    
    def tocar_beep(self):
        """Fallback: toca beep simples"""
        print("🔊 Tocando beep (fallback)...")
        while self.som_tocando:
            winsound.Beep(440, 500)
            if not self.som_tocando:
                break
            time.sleep(0.1)
            winsound.Beep(880, 300)
            time.sleep(0.1)
    
    def parar_som(self):
        self.som_tocando = False
        try:
            winsound.PlaySound(None, winsound.SND_PURGE)
        except:
            pass
        print("🔇 Som parado!")
    
    def esperar_sorriso_e_pergunta(self, arquivo_som, tempo_necessario=3):
        """Espera o sorriso e depois faz a pergunta - SOM CONTINUA TOCANDO"""
        print("\n" + "="*50)
        print("⏰ TEMPO ACABOU!")
        print("="*50)
        print("🔐 Para parar o despertador você precisa:")
        print("   1️⃣  Sorrir por 3 segundos")
        print("   2️⃣  Responder uma pergunta (ERRAR = REINICIAR)")
        print("   ⚠️  O som SÓ PARA quando você completar AMBOS!")
        print("   Pressione 'q' para cancelar\n")
        
        if not os.path.exists(arquivo_som):
            print(f"⚠️ Arquivo '{arquivo_som}' não encontrado!")
            print("   Usando beep como fallback...")
            arquivo_som = None
        
        # INICIA O SOM EM LOOP
        som_thread = threading.Thread(target=self.tocar_som_loop, args=(arquivo_som,))
        som_thread.daemon = True
        som_thread.start()
        
        # PASSO 1: DETECTAR SORRISO
        print("\n" + "="*50)
        print("😊 PASSO 1: SORRIA POR 3 SEGUNDOS!")
        print("="*50)
        print("🔊 O som CONTINUA TOCANDO enquanto você faz isso!")
        
        if not self.iniciar_camera():
            self.parar_som()
            return "erro"
        
        tempo_sorrindo = 0
        sorriso_iniciado = False
        sorriso_confirmado = False
        
        while not sorriso_confirmado:
            ret, frame = self.camera.read()
            if not ret:
                print("⚠️ Erro ao ler frame da câmera!")
                time.sleep(0.1)
                continue
            
            frame = cv2.flip(frame, 1)
            expressao, frame_processado = self.detectar_expressao_melhorada(frame)
            
            cv2.putText(frame_processado, "🔊 SOM TOCANDO!", 
                       (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            if expressao == "FELIZ":
                if not sorriso_iniciado:
                    sorriso_iniciado = True
                    tempo_sorrindo = time.time()
                    print("\n😊 Sorrindo... Continue!")
                
                tempo_atual = time.time()
                tempo_continuo = tempo_atual - tempo_sorrindo
                
                cv2.putText(frame_processado, f"Tempo: {tempo_continuo:.1f}s / {tempo_necessario}s", 
                           (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                progresso = int((tempo_continuo / tempo_necessario) * 20)
                barra = "█" * min(progresso, 20) + "░" * max(0, 20 - progresso)
                cv2.putText(frame_processado, f"[{barra}]", 
                           (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                
                if tempo_continuo >= tempo_necessario:
                    print("\n✅ SORRISO DETECTADO! 🎉")
                    sorriso_confirmado = True
                    break
            else:
                if sorriso_iniciado:
                    print("⚠️ Parou de sorrir! Continue...")
                sorriso_iniciado = False
                tempo_sorrindo = 0
            
            cv2.imshow('PASSO 1: SORRIA! (SOM TOCANDO)', frame_processado)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\n❌ Cancelado!")
                self.parar_som()
                self.fechar_camera()
                return "cancelado"
        
        self.fechar_camera()
        
        # PASSO 2: PERGUNTA
        print("\n" + "="*50)
        print("🤔 PASSO 2: RESPONDA A PERGUNTA!")
        print("="*50)
        print("🔊 O som CONTINUA TOCANDO enquanto você responde!")
        print("   SÓ PARA quando você ACERTAR!\n")
        
        resultado_pergunta = self.fazer_pergunta()
        
        if resultado_pergunta:
            self.parar_som()
            print("\n" + "="*50)
            print("🎉 PARABÉNS! VOCÊ COMPLETOU TODOS OS DESAFIOS!")
            print("🔔 DESPERTADOR DESLIGADO!")
            print("="*50)
            return "sucesso"
        else:
            self.parar_som()
            print("\n" + "="*50)
            print("🔄 REINICIANDO TIMER!")
            print("="*50)
            return "reiniciar"

class TimerSorriso:
    def __init__(self):
        self.detector = DetectorSorriso()
        self.tempo_total = 0
        
    def timer(self, segundos, arquivo_som):
        self.tempo_total = segundos
        os.system('cls' if os.name == 'nt' else 'clear')
        
        print(f"⏰ TIMER: {segundos} segundos")
        print(f"🔊 Som: {arquivo_som}")
        print("🔐 Para desligar o despertador:")
        print("   1️⃣  Sorria por 3 segundos (som continua)")
        print("   2️⃣  Responda uma pergunta (som continua)")
        print("   ✅ SÓ PARA O SOM quando você ACERTAR A PERGUNTA!")
        print("   ❌ ERRAR A PERGUNTA = REINICIAR O TIMER")
        print("   Pressione Ctrl+C para interromper\n")
        print("-" * 30)
        
        for i in range(segundos, -1, -1):
            minutos = i // 60
            seg = i % 60
            print(f"\r⏱️  {minutos:02d}:{seg:02d}", end="", flush=True)
            
            if i == 0:
                print("\n\n⏰ TEMPO ACABOU!")
                resultado = self.detector.esperar_sorriso_e_pergunta(arquivo_som, 3)
                
                if resultado == "sucesso":
                    print("\n✅ Timer finalizado com sucesso!")
                    return
                elif resultado == "reiniciar":
                    print("\n🔄 Reiniciando timer em 3 segundos...")
                    time.sleep(3)
                    self.timer(segundos, arquivo_som)
                    return
                elif resultado == "cancelado":
                    print("\n❌ Cancelado pelo usuário!")
                    return
                else:
                    print("\n❌ Erro! Timer finalizado.")
                    return
            
            time.sleep(1)

def main():
    arquivo_som = "universfield-game-bonus-02-294436.wav"
    
    if not os.path.exists(arquivo_som):
        print(f"⚠️ Arquivo '{arquivo_som}' não encontrado!")
        print("   Verifique se o nome está correto")
        print("   Usando beep como fallback...\n")
        arquivo_som = None
    else:
        print(f"✅ Arquivo de som encontrado: {arquivo_som}\n")
    
    timer = TimerSorriso()
    
    while True:
        try:
            print("\n" + "="*40)
            print("🕐 TIMER DO SORRISO + PERGUNTA")
            print("="*40)
            print("1 - 30 segundos")
            print("2 - 60 segundos")
            print("3 - 5 minutos")
            print("4 - Personalizado")
            print("5 - Sair")
            print("="*40)
            
            opcao = input("Escolha: ").strip()
            
            if opcao == "5":
                print("Saindo...")
                break
            elif opcao == "1":
                print("\n🎭 Preparando para iniciar o timer...")
                if timer.detector.esperar_expressao_inicial(5):
                    timer.timer(30, arquivo_som)
                else:
                    print("❌ Não foi possível iniciar o timer!")
            elif opcao == "2":
                print("\n🎭 Preparando para iniciar o timer...")
                if timer.detector.esperar_expressao_inicial(5):
                    timer.timer(60, arquivo_som)
                else:
                    print("❌ Não foi possível iniciar o timer!")
            elif opcao == "3":
                print("\n🎭 Preparando para iniciar o timer...")
                if timer.detector.esperar_expressao_inicial(5):
                    timer.timer(300, arquivo_som)
                else:
                    print("❌ Não foi possível iniciar o timer!")
            elif opcao == "4":
                try:
                    total = int(input("Segundos: "))
                    if total > 0:
                        print("\n🎭 Preparando para iniciar o timer...")
                        if timer.detector.esperar_expressao_inicial(5):
                            timer.timer(total, arquivo_som)
                        else:
                            print("❌ Não foi possível iniciar o timer!")
                    else:
                        print("❌ Deve ser maior que 0!")
                except:
                    print("❌ Digite um número!")
            else:
                print("❌ Opção inválida!")
                
        except KeyboardInterrupt:
            print("\n\n⏹️ Interrompido!")
            try:
                timer.detector.parar_som()
            except:
                pass
            break
        except Exception as e:
            print(f"❌ Erro: {e}")

if __name__ == "__main__":
    main()