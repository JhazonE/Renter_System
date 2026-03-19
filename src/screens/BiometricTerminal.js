import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing, 
  Dimensions, 
  Platform 
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { 
  Fingerprint, 
  ShieldCheck, 
  Activity, 
  Database, 
  Cpu, 
  Wifi, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  X 
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export const BiometricTerminal = ({ onExit }) => {
  const [status, setStatus] = useState('IDLE'); // IDLE, SCANNING, SUCCESS, ERROR
  const [progress, setProgress] = useState(0);
  const [scanStep, setScanStep] = useState(0);
  
  const scanAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the scanner
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const startScan = () => {
    setStatus('SCANNING');
    setProgress(0);
    setScanStep(1);
    runScanCycle(1);
  };

  const runScanCycle = (step) => {
    setScanStep(step);
    
    // Start scanline animation
    scanAnim.setValue(0);
    Animated.timing(scanAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    let currentProgress = (step - 1) * 33;
    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress(Math.min(currentProgress, step * 33.3));
      
      if (currentProgress >= step * 33.3) {
        clearInterval(interval);
        if (step < 3) {
          setTimeout(() => runScanCycle(step + 1), 500);
        } else {
          setTimeout(() => {
            setProgress(100);
            setStatus('SUCCESS');
          }, 800);
        }
      }
    }, 40);
  };

  const reset = () => {
    setStatus('IDLE');
    setProgress(0);
    setScanStep(0);
    scanAnim.setValue(0);
  };

  const renderStatusInfo = () => {
    switch (status) {
      case 'IDLE':
        return {
          title: 'SYSTEM READY',
          subtitle: 'AWAITING BIOMETRIC INPUT',
          color: colors.primary,
          icon: <Fingerprint size={80} color={colors.primary} strokeWidth={1} />
        };
      case 'SCANNING':
        return {
          title: 'CAPTURING',
          subtitle: `PROCESSING LAYER ${scanStep} OF 3`,
          color: colors.primary,
          icon: <Fingerprint size={80} color={colors.primary} strokeWidth={1} />
        };
      case 'SUCCESS':
        return {
          title: 'ACCESS GRANTED',
          subtitle: 'IDENTITY VERIFIED & SECURED',
          color: colors.emerald500,
          icon: <CheckCircle2 size={80} color={colors.emerald500} strokeWidth={1} />
        };
      case 'ERROR':
        return {
          title: 'ACCESS DENIED',
          subtitle: 'INVALID BIOMETRIC PROFILE',
          color: colors.rose500,
          icon: <AlertCircle size={80} color={colors.rose500} strokeWidth={1} />
        };
    }
  };

  const currentInfo = renderStatusInfo();

  return (
    <View style={styles.outerContainer}>
      {/* Background Glows */}
      <View style={[styles.bgGlow, { top: -100, left: -100, backgroundColor: 'rgba(17, 50, 212, 0.08)' }]} />
      <View style={[styles.bgGlow, { bottom: -100, right: -100, backgroundColor: 'rgba(16, 185, 129, 0.05)' }]} />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.terminalIcon}>
            <Cpu size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.terminalTitle}>SECUREACCESS™ TERMINAL</Text>
            <Text style={styles.terminalVersion}>V2.4.0-STABLE // ENCRYPTION ACTIVE</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.statusLabel}>
            <View style={[styles.statusDot, { backgroundColor: status === 'SUCCESS' ? colors.emerald500 : colors.primary }]} />
            <Text style={styles.statusLabelText}>{status === 'SCANNING' ? 'SYSTEM ACTIVE' : 'TERMINAL READY'}</Text>
          </View>
          {onExit && (
            <TouchableOpacity onPress={onExit} style={styles.exitButton}>
              <X size={20} color={colors.slate400} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Main Terminal Frame */}
        <View style={styles.terminalFrame}>
          {/* Decorative Corner Accents */}
          <View style={[styles.corner, { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 }]} />
          <View style={[styles.corner, { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 }]} />
          <View style={[styles.corner, { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 }]} />
          <View style={[styles.corner, { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 }]} />

          <View style={styles.contentInner}>
            {/* Scanner Area */}
            <View style={styles.scannerWrapper}>
              <Animated.View style={[
                styles.scannerCircle,
                {
                  borderColor: currentInfo.color,
                  ...Platform.OS === 'web' 
                    ? { boxShadow: `0px 0px 20px ${currentInfo.color}44` } 
                    : { shadowColor: currentInfo.color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20 },
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1]
                  }),
                  transform: [{
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05]
                    })
                  }]
                }
              ]}>
                <View style={styles.iconContainer}>
                  {currentInfo.icon}
                </View>

                {status === 'SCANNING' && (
                  <Animated.View style={[
                    styles.scanline,
                    {
                      backgroundColor: currentInfo.color,
                      transform: [{
                        translateY: scanAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-100, 100]
                        })
                      }]
                    }
                  ]} />
                )}
              </Animated.View>

              <View style={styles.textContainer}>
                <Text style={[styles.statusTitle, { color: currentInfo.color }]}>{currentInfo.title}</Text>
                <Text style={styles.statusSubtitle}>{currentInfo.subtitle}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBackground, { borderColor: colors.slate100 }]}>
                  <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: currentInfo.color }]} />
                </View>
              </View>
              <View style={styles.progressMeta}>
                <Text style={styles.progressPercent}>{Math.round(progress)}% SECURED</Text>
                <Text style={styles.progressHash}>NODE_0XF4A2...{status === 'IDLE' ? 'READY' : 'BUSY'}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {status === 'IDLE' ? (
                <TouchableOpacity style={styles.primaryActionButton} onPress={startScan}>
                  <Text style={styles.actionButtonText}>INITIATE BIOMETRIC SCAN</Text>
                </TouchableOpacity>
              ) : status === 'SCANNING' ? (
                <View style={[styles.primaryActionButton, { opacity: 0.6 }]}>
                  <Activity size={20} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.actionButtonText}>SCANNING...</Text>
                </View>
              ) : (
                <View style={styles.successActions}>
                  <TouchableOpacity style={styles.secondaryActionButton} onPress={reset}>
                    <RefreshCw size={18} color={colors.slate500} style={{ marginRight: 8 }} />
                    <Text style={styles.secondaryButtonText}>RESET TERMINAL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryActionButton, { backgroundColor: colors.emerald500 }]} onPress={reset}>
                    <Text style={styles.actionButtonText}>PROCEED</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Footer Stats */}
        <View style={styles.footerStats}>
          <View style={styles.statItem}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text style={styles.statText}>RSA-4096 VALID</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Wifi size={16} color={colors.primary} />
            <Text style={styles.statText}>LOCAL GATEWAY</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Database size={16} color={colors.primary} />
            <Text style={styles.statText}>SYNCED</Text>
          </View>
        </View>
      </View>

      {/* Decorative Sidebar Elements (Simulation) */}
      <View style={styles.decorationLeft}>
        {[1,2,3,4,5].map(i => (
          <View key={i} style={[styles.decLine, { width: i * 8, opacity: 0.1 }]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
  },
  header: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  terminalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.indigo50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.indigo100,
  },
  terminalTitle: {
    ...typography.h3,
    color: colors.slate900,
    letterSpacing: 1.5,
    fontSize: 16,
    fontWeight: '900',
  },
  terminalVersion: {
    ...typography.tiny,
    color: colors.slate500,
    marginTop: 2,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.indigo50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.indigo100,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabelText: {
    ...typography.tiny,
    color: colors.primary,
    letterSpacing: 1,
    fontWeight: '800',
  },
  exitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  terminalFrame: Platform.OS === 'web'
    ? { width: '100%', maxWidth: 600, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 32, borderWidth: 1, borderColor: colors.slate100, padding: 48, position: 'relative', boxShadow: '0px 20px 40px rgba(15, 23, 42, 0.1)' }
    : { width: '100%', maxWidth: 600, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 32, borderWidth: 1, borderColor: colors.slate100, padding: 48, position: 'relative', shadowColor: colors.slate900, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 40 },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.primary,
    opacity: 0.3,
  },
  contentInner: {
    alignItems: 'center',
    gap: 40,
  },
  scannerWrapper: {
    alignItems: 'center',
    gap: 24,
  },
  scannerCircle: Platform.OS === 'web'
    ? { width: 220, height: 220, borderRadius: 110, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.slate50, overflow: 'hidden' }
    : { width: 220, height: 220, borderRadius: 110, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.slate50, overflow: 'hidden', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20 },
  iconContainer: {
    zIndex: 2,
  },
  scanline: Platform.select({
    web: { position: 'absolute', width: '100%', height: 4, zIndex: 3 },
    default: { position: 'absolute', width: '100%', height: 4, zIndex: 3 }
  }),
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    ...typography.h1,
    fontSize: 24,
    letterSpacing: 4,
    fontWeight: '900',
  },
  statusSubtitle: {
    ...typography.body,
    color: colors.slate500,
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: '600',
  },
  progressSection: {
    width: '100%',
    gap: 12,
  },
  progressContainer: {
    width: '100%',
  },
  progressBackground: {
    width: '100%',
    height: 10,
    backgroundColor: colors.slate100,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    ...typography.tiny,
    color: colors.slate500,
    fontWeight: '800',
  },
  progressHash: {
    ...typography.tiny,
    color: colors.slate400,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionsContainer: {
    width: '100%',
  },
  primaryActionButton: Platform.OS === 'web'
    ? { width: '100%', height: 60, backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', boxShadow: '0px 8px 20px rgba(17, 50, 212, 0.3)' }
    : { width: '100%', height: 60, backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
  actionButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '900',
    letterSpacing: 2,
  },
  successActions: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryActionButton: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.slate600,
    fontWeight: '800',
  },
  footerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 32,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    ...typography.tiny,
    color: colors.slate500,
    letterSpacing: 1,
    fontWeight: '700',
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slate200,
  },
  decorationLeft: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    gap: 6,
  },
  decLine: {
    height: 2,
    backgroundColor: colors.primary,
  }
});
